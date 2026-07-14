import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";
import dbConnect from "@/lib/dbConnect";
import User, { Notification, PendingCode } from "@/models/AdminModels";
import eventBus, { ADMIN_EVENTS } from "@/lib/eventBus";
import { generateEmailTemplate } from "@/lib/emailTemplates";
import { SITE_URL } from "@/lib/config";
import { verifyPasskey, hashPasskey } from "@/lib/passwordReset";
import { getAuthSecretKey } from "@/lib/authSecret";

const SECRET = getAuthSecretKey();

// Super Admin Configuration - Now dynamically loaded from DB with fallback
const ROOT_ADMIN_EMAIL = (
    process.env.SUPER_ADMIN_EMAIL || "attariattari549@gmail.com"
).toLowerCase();

function resolveSafeRole(user) {
    const email = user.email?.toLowerCase();
    if (email === ROOT_ADMIN_EMAIL) return "root-super-admin";
    if (user.role === "root-super-admin") return "super-admin";
    return user.role || "user";
}

export function getDefaultAuthRedirect(user, callbackUrl = "") {
    if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
        const callbackPath = callbackUrl.split(/[?#]/, 1)[0].replace(/\/$/, "");
        if (callbackPath !== "/admin/login" && callbackPath !== "/admin/signup") {
            return callbackUrl;
        }
    }
    return "/admin/dashboard";
}

export function attachAdminSessionCookies(response, token) {
    const cookieOptions = {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 8,
        path: "/",
    };

    response.cookies.set("admin_auth_token", token, {
        ...cookieOptions,
        httpOnly: true,
    });
    response.cookies.set("admin_token", token, {
        ...cookieOptions,
        httpOnly: false,
    });
    return response;
}

export async function createAdminSession(user, source = "credentials") {
    const normalizedEmail = user.email.toLowerCase();
    const finalRole = resolveSafeRole({ ...user, email: normalizedEmail });

    const token = await new SignJWT({
            role: finalRole,
            email: normalizedEmail,
            userId: user._id.toString(),
            name: user.name,
            avatar: user.avatar || "",
            authSource: source,
        })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("8h")
        .sign(SECRET);

    const cookieOptions = {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 8,
        path: "/",
    };

    (await cookies()).set("admin_auth_token", token, {
        ...cookieOptions,
        httpOnly: true,
    });

    (await cookies()).set("admin_token", token, {
        ...cookieOptions,
        httpOnly: false,
    });

    return {
        success: true,
        token,
        email: normalizedEmail,
        role: finalRole,
        name: user.name,
        avatar: user.avatar || "",
    };
}

/**
 * Parse JWT payload without verification (client-side helper)
 * Extracts exp and other claims safely
 */
export function parseJWT(token) {
    if (!token) return null;
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        return payload;
    } catch (e) {
        return null;
    }
}

/**
 * Check if JWT token is expired
 * Returns true if exp claim is in the past
 */
export function isTokenExpired(token) {
    if (!token) return true;
    const payload = parseJWT(token);
    if (!payload || !payload.exp) return true;
    // exp is in seconds, Date.now() is in ms
    return Math.floor(Date.now() / 1000) >= payload.exp;
}

function isJwtVerificationError(error) {
    return (
        typeof error?.code === "string" &&
        (error.code.startsWith("ERR_JWT_") || error.code.startsWith("ERR_JWS_"))
    );
}

/**
 * Format email-derived name into a more readable format.
 * john_doe -> John Doe, muhyotech -> Muhyotech
 */
export const formatName = (name) => {
    if (!name) return "";
    return name
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

// NodeMailer Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function addNotification(payload) {
    await dbConnect();
    const newNotif = await Notification.create({
        status: "unread",
        ...payload,
    });

    // Broadcast for real-time dashboards
    eventBus.emit(ADMIN_EVENTS.NOTIFICATION, newNotif);
    return newNotif;
}

export async function sendVerificationCode(email, type = "setup") {
    if (!email) return { success: false, message: "Email required." };
    await dbConnect();
    const normalizedEmail = email.toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Upsert pending code
    await PendingCode.findOneAndUpdate({ email: normalizedEmail }, { code, expiry: new Date(Date.now() + 5 * 60 * 1000), type }, { upsert: true, new: true }, );

    const subject =
        type === "setup" ?
        "Admin Identity Verification" :
        "Passkey Reset Verification";
    try {
        if (!process.env.SMTP_USER) {
            console.warn(`DEV MODE - Email: ${normalizedEmail}, Code: ${code}`);
            return { success: true, mocked: true, code };
        }
        await transporter.sendMail({
            from: `"Muhyo Tech Security" <${process.env.SMTP_USER}>`,
            to: normalizedEmail,
            subject: `[Muhyo] ${subject}`,
            html: generateEmailTemplate({
                userName: formatName(normalizedEmail.split("@")[0]),
                type: "VERIFICATION",
                actionData: { code },
                ctaUrl: `${SITE_URL}/admin/login`,
            }),
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function verifyAndHandleRequest(email, code) {
    if (!email) return { success: false, message: "Email required." };
    await dbConnect();
    const normalizedEmail = email.toLowerCase();
    const pending = await PendingCode.findOne({ email: normalizedEmail, code });

    if (!pending || new Date() > pending.expiry) {
        return { success: false, message: "Invalid or expired token sequence." };
    }

    // ⭐ PROFESSIONAL: Dynamically resolve Super Admin from Database or Environment
    const { getSuperAdminConfigWithFallback } =
    await
    import ("@/lib/transferUtils");
    const { SiteConfig } = await
    import ("@/models/Portfolio");
    const { superAdminEmail, superAdminName } =
    await getSuperAdminConfigWithFallback(dbConnect, SiteConfig);

    const isSuperAdmin = normalizedEmail === superAdminEmail;

    // Check Blacklist (24h for removed users)
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.status === "removed") {
        const removedTime = new Date(existingUser.createdAt).getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (Date.now() - removedTime < twentyFourHours) {
            const remaining = Math.ceil(
                (twentyFourHours - (Date.now() - removedTime)) / (60 * 60 * 1000),
            );
            return {
                success: false,
                message: `Access node blacklisted. Retry in ${remaining} hours.`,
            };
        }
    }

    await PendingCode.deleteOne({ _id: pending._id });

    if (isSuperAdmin) {
        const passkey = Math.random().toString(36).slice(-10).toUpperCase();
        const hashedPasskey = hashPasskey(passkey);
        const user = await User.findOneAndUpdate({ email: normalizedEmail }, {
            name: superAdminName,
            passkey: hashedPasskey,
            role: "super-admin",
            status: "approved",
            createdAt: new Date(),
        }, { upsert: true, new: true }, );
        // Auto-login on verification for Super Admin
        await login(normalizedEmail, passkey);
        return { success: true, role: "super-admin", passkey };
    } else {
        // Check if user already exists
        const isReverify = !!existingUser;
        let user;
        const generatedName = normalizedEmail.split("@")[0];

        if (!existingUser) {
            user = await User.create({
                email: normalizedEmail,
                name: generatedName,
                status: "pending",
                role: "user",
                createdAt: new Date(),
            });
        } else {
            existingUser.status = "pending";
            existingUser.name = generatedName; // Reset name to email-derived name on re-verify
            existingUser.createdAt = new Date();
            await existingUser.save();
            user = existingUser;
        }

        const displayName = formatName(user.name);

        // Add REVERIFY_REQUEST or USER_REQUEST Notification for Super Admin
        await addNotification({
            type: isReverify ? "REVERIFY_REQUEST" : "USER_REQUEST",
            title: isReverify ?
                "Re-Verification Pulse Detected" : "Access Authorization Required",
            message: isReverify ?
                `${displayName} (${normalizedEmail}) is requesting authority restoration.` : `${displayName} (${normalizedEmail}) is requesting initial registration.`,
            relatedUserId: user._id,
        });

        return { success: true, role: "user", pendingApproval: true };
    }
}

export async function login(email, passkey) {
    if (!email) return { success: false, message: "Email required." };
    await dbConnect();
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.status === "removed") {
        return {
            success: false,
            code: "NOT_FOUND",
            message: "Identity not recognized or deleted.",
        };
    }

    // A Google-linked credentials account can still sign in manually. Only a
    // Google-origin account with no passkey must continue through Google.
    if (!user.passkey) {
        return {
            success: false,
            code: "GOOGLE_ONLY",
            message: "No manual passkey is set for this account. Continue with Google instead.",
        };
    }

    const { valid: isPasskeyValid, method: verificationMethod } =
    await verifyPasskey(passkey, user.passkey);

    if (!isPasskeyValid || user.status !== "approved") {
        return {
            success: false,
            code: "INVALID",
            message: "Authority credentials mismatch or pending authorization.",
        };
    }

    // ⭐ AUTO-MIGRATION: If verified with legacy method, upgrade to bcrypt immediately
    if (verificationMethod && verificationMethod !== "bcrypt") {
        console.log(
            `[Security] 🛡️ Migrating passkey for ${normalizedEmail} from ${verificationMethod} to bcrypt...`,
        );
        const newHash = hashPasskey(passkey);
        await User.updateOne({ _id: user._id }, { $set: { passkey: newHash } });
        console.log(`[Security] ✅ Migration successful for ${normalizedEmail}.`);
    }

    // ⭐ ROOT AUTHORITY PROTECTION: Email from .env ALWAYS overrides DB role
    let finalRole = user.role;
    if (normalizedEmail === ROOT_ADMIN_EMAIL) {
        finalRole = "root-super-admin";
    }

    const token = await new SignJWT({
            role: finalRole,
            email: normalizedEmail,
            userId: user._id.toString(),
            name: user.name,
            // Removed permissions from JWT payload to prevent stale data
        })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("8h")
        .sign(SECRET);

    (await cookies()).set("admin_auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 8,
        path: "/",
    });

    // Also set a non-httpOnly cookie for client access
    (await cookies()).set("admin_token", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 8,
        path: "/",
    });

    return {
        success: true,
        token, // Send token to client so it can store in localStorage
        email: normalizedEmail,
        role: finalRole,
        name: user.name,
    };
}

export async function logout() {
    (await cookies()).delete("admin_auth_token");
}

export async function approveUser(email) {
    if (!email) return { success: false, message: "Email required." };
    await dbConnect();
    const normalizedEmail = email.toLowerCase();

    // 👑 ROOT PROTECTION
    if (normalizedEmail === ROOT_ADMIN_EMAIL) {
        return { success: false, message: "Root Authority is self-managed." };
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return { success: false, message: "Identity not found." };

    const passkey = Math.random().toString(36).slice(-10).toUpperCase();
    user.passkey = hashPasskey(passkey);
    user.status = "approved";
    await user.save();

    // Mark related notifications as approved
    await Notification.updateMany({ relatedUserId: user._id, status: "unread" }, { $set: { status: "approved" } }, );

    // Broadcast for real-time dashboards
    eventBus.emit(ADMIN_EVENTS.USER_UPDATE, { email: normalizedEmail, status: "approved" });

    // LOG: Administrative Audit
    await addNotification({
        type: "USER_APPROVED",
        title: "Authority Extended",
        message: `Identity Authorized: ${email}. New access node established.`,
        relatedUserId: user._id,
        status: "read",
    });

    // Send Passkey Email
    try {
        if (process.env.SMTP_USER) {
            const isReverify = await Notification.exists({
                relatedUserId: user._id,
                type: "REVERIFY_REQUEST",
            });
            await transporter.sendMail({
                from: `"Muhyo Tech Authority" <${process.env.SMTP_USER}>`,
                to: normalizedEmail,
                subject: isReverify ?
                    "Muhyo Tech — Authority Restored" : "Muhyo Tech — Account Verification Approved",
                html: generateEmailTemplate({
                    userName: formatName(user.name),
                    type: isReverify ? "REVERIFY_APPROVED" : "APPROVED",
                    actionData: { passkey },
                    ctaUrl: `${SITE_URL}/admin/login`,
                }),
            });
        }
    } catch (e) {
        console.warn("Approve email failed.");
    }

    return { success: true, passkey };
}

export async function denyUser(email) {
    if (!email) return { success: false, message: "Email required." };
    await dbConnect();
    const normalizedEmail = email.toLowerCase();

    // 👑 ROOT PROTECTION
    if (normalizedEmail === ROOT_ADMIN_EMAIL) {
        return { success: false, message: "Root Authority cannot be denied." };
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
        user.status = "denied";
        await user.save();

        await Notification.updateMany({ relatedUserId: user._id, status: "unread" }, { $set: { status: "denied" } }, );

        // BROADCAST: FORCED LOGOUT (Deny)
        eventBus.emit(ADMIN_EVENTS.USER_UPDATE, {
            email: normalizedEmail,
            status: "denied",
            forceLogout: true,
        });

        await addNotification({
            type: "USER_DENIED",
            title: "Identity Refused",
            message: `Authorization denied for: ${email}. Node restricted.`,
            relatedUserId: user._id,
        });

        // Send Denial Email
        try {
            if (process.env.SMTP_USER) {
                await transporter.sendMail({
                    from: `"Muhyo Tech Authority" <${process.env.SMTP_USER}>`,
                    to: normalizedEmail,
                    subject: "Muhyo Tech — Identity Authorization Refused",
                    html: generateEmailTemplate({
                        userName: formatName(user.name),
                        type: "DENIED",
                        ctaUrl: `${SITE_URL}/admin/login`,
                    }),
                });
            }
        } catch (e) {
            console.warn("Deny email failed.");
        }

        return { success: true };
    }
    return { success: false, message: "Identity not found." };
}

export async function removeUser(email) {
    if (!email) return { success: false, message: "Email required." };
    await dbConnect();
    const normalizedEmail = email.toLowerCase();

    // 👑 ROOT PROTECTION
    if (normalizedEmail === ROOT_ADMIN_EMAIL) {
        return { success: false, message: "Root Authority is immutable and cannot be removed." };
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
        user.status = "removed";
        user.createdAt = new Date(); // Using as 'removedAt' for 24h block
        await user.save();

        // FORCED LOGOUT BROADCAST
        eventBus.emit(ADMIN_EVENTS.USER_UPDATE, {
            email: normalizedEmail,
            status: "removed",
            forceLogout: true,
        });

        await addNotification({
            type: "USER_REMOVED",
            title: "Authority Revoked",
            message: `Identity deleted from Muhyo Tech: ${email}. Access restricted for 24h.`,
            relatedUserId: user._id,
        });

        // Send Removal Email
        try {
            if (process.env.SMTP_USER) {
                await transporter.sendMail({
                    from: `"Muhyo Tech Authority" <${process.env.SMTP_USER}>`,
                    to: normalizedEmail,
                    subject: "Muhyo Tech — Administrative Access Revoked",
                    html: generateEmailTemplate({
                        userName: formatName(user.name),
                        type: "REMOVED",
                        ctaUrl: `${SITE_URL}/admin/login`,
                    }),
                });
            }
        } catch (e) {
            console.warn("Removal email failed.");
        }

        return { success: true };
    }
    return { success: false, message: "Identity not found." };
}

export async function deleteNotification(id) {
    await dbConnect();
    await Notification.findByIdAndDelete(id);
    return true;
}

export async function updateNotificationStatus(id, status) {
    await dbConnect();
    const notif = await Notification.findById(id);
    if (notif) {
        notif.status = status;
        await notif.save();
        return true;
    }
    return false;
}

export async function getAuthSession() {
    const token = (await cookies()).get("admin_auth_token")?.value;
    if (!token) return null;

    // PATCH: Check token expiration BEFORE verification
    if (isTokenExpired(token)) {
        // Treat stale or malformed cookies as a signed-out session. Cookie
        // deletion is handled by the proxy/route layer, where response cookies
        // can safely be mutated.
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, SECRET);
        console.log(
            `[Auth] Token verified for ${payload.email} (Role: ${payload.role})`,
        );
        await dbConnect();

        // ALWAYS fetch fresh data from DB. Use .lean() to bypass Mongoose's internal state.
        let user = await User.findOne({ email: payload.email }).lean();

        if (!user || user.status !== "approved") {
            // SPECIAL CASE: ROOT_ADMIN_EMAIL might not be in DB yet or role might be different
            // But if they have a valid token for that email, we can grant ROOT access
            if (payload.email?.toLowerCase() === ROOT_ADMIN_EMAIL) {
                return {
                    userId: user?._id?.toString() || "root-admin-id",
                    email: ROOT_ADMIN_EMAIL,
                    role: "root-super-admin",
                    name: user?.name || "Root Super Admin",
                    avatar: user?.avatar || "",
                    permissions: { all: true },
                };
            }
            console.warn(
                `[Auth] User rejected. Found: ${!!user}, Status: ${user?.status}`,
            );
            return null;
        }

        // ⭐ ROOT AUTHORITY PROTECTION: Email from .env ALWAYS overrides DB role
        let finalRole = user.role;
        const isRootEmail = user.email?.toLowerCase() === ROOT_ADMIN_EMAIL;

        if (isRootEmail) {
            finalRole = "root-super-admin";
        } else if (finalRole === "root-super-admin") {
            // SECURITY: Prevent non-root emails from assuming root role even if set in DB
            finalRole = "super-admin";
        }

        return {
            userId: user._id.toString(),
            email: user.email,
            role: finalRole,
            name: user.name,
            avatar: user.avatar || "",
            permissions: user.permissions || {},
        };
    } catch (e) {
        // Invalid signatures and expired JWTs are an expected signed-out state
        // after secret rotation; do not surface them as application errors.
        if (!isJwtVerificationError(e)) {
            console.error("[Auth] Session lookup failed:", e);
        }
        return null;
    }
}

/**
 * Professional Permission Gate
 * @param {Object} session - Session from getAuthSession()
 * @param {string} module - Module name (projects, blogs, etc.)
 * @param {string} action - Action (create, edit, delete)
 */
export function checkPermission(session, module, action = "edit") {
    if (!session) return false;

    // Super-admin has absolute authority
    if (session.role === "super-admin" || session.role === "root-super-admin")
        return true;

    // Admin or Staff role requires explicit permission for the specific module and action
    if (session.role === "admin" || session.role === "user") {
        if (!session.permissions) return false;

        // Case-insensitive module and action check for maximum reliability
        const userPermissions = session.permissions;
        return !!userPermissions[module]?.[action];
    }

    return false;
}

/**
 * Update User Role and Permissions (Super-Admin only)
 * Direct database write for consistent metadata persistence
 */
export async function updateUserMetadata(
    email, { role, permissions },
    actorSession = null,
) {
    if (!email) return { success: false, message: "Email required." };
    try {
        await dbConnect();
        const normalizedEmail = email.toLowerCase();

        // 👑 ROOT PROTECTION: Cannot modify ROOT_ADMIN_EMAIL via API
        if (normalizedEmail === ROOT_ADMIN_EMAIL) {
            return {
                success: false,
                message: "❌ Security Breach: Root Super Admin authority is immutable.",
            };
        }

        // 👑 ROLE PROTECTION: Cannot promote anyone to root-super-admin
        if (role === "root-super-admin") {
            return {
                success: false,
                message: "❌ Security Breach: Root Super Admin role is reserved for internal system use.",
            };
        }

        // 🛡️ SINGLE SECONDARY SUPER ADMIN ENFORCEMENT
        if (role === "super-admin") {
            // Find all other secondary super admins (excluding current target and root)
            const otherSuperAdmins = await User.find({
                role: "super-admin",
                email: { $ne: normalizedEmail, $nin: [ROOT_ADMIN_EMAIL] },
            }).lean();

            if (otherSuperAdmins.length > 0) {
                const otherEmails = otherSuperAdmins.map((u) => u.email);
                console.log(
                    `[AUTH] 🛡️ Auto-downgrading ${otherEmails.length} previous Super Admin(s): ${otherEmails.join(", ")}`,
                );

                await User.updateMany({ email: { $in: otherEmails } }, { $set: { role: "admin" } }, );

                // Individually signal each downgraded user for security sync
                otherEmails.forEach((oldEmail) => {
                    eventBus.emit(ADMIN_EVENTS.USER_UPDATE, {
                        email: oldEmail,
                        role: "admin",
                        forceLogout: true,
                    });
                });
            }
        }

        // Atomic update ensures the latest data is persisted immediately
        const result = await User.updateOne({ email: normalizedEmail }, { $set: { role, permissions } }, );

        if (result.matchedCount > 0) {
            // Signal real-time dashboards to re-sync
            eventBus.emit(ADMIN_EVENTS.USER_UPDATE, {
                email: normalizedEmail,
                role,
                permissions,
            });
            console.log(
                `[AUTH] Authority recalibrated: ${normalizedEmail} -> Role: ${role}.`,
            );
            return { success: true };
        } else {
            return { success: false, message: "Personnel record not found." };
        }
    } catch (error) {
        console.error("[AUTH] Critical Metadata Write Failure:", error);
        return {
            success: false,
            message: "Shield failure: Metadata rejected by database.",
        };
    }
}

export async function getAllUsers() {
    await dbConnect();
    return await User.find({}).sort({ createdAt: -1 }).lean();
}

export async function getAllNotifications() {
    await dbConnect();
    return await Notification.find({}).sort({ createdAt: -1 }).lean();
}

export async function isUserActive(email) {
    if (!email) return false;
    await dbConnect();
    const user = await User.findOne({ email, status: "approved" });
    return !!user;
}

export async function isSetupComplete() {
    await dbConnect();
    // Setup is complete if either a Root Super Admin or a Super Admin exists in the database
    const adminExists = await User.findOne({
        role: { $in: ["super-admin", "root-super-admin"] },
        status: "approved",
    });
    return !!adminExists;
}

export async function getPendingApprovals() {
    await dbConnect();
    return await User.find({ status: "pending" }).lean();
}
