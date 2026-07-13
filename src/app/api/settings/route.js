import dbConnect from "@/lib/dbConnect";
import { SiteConfig } from "@/models/Portfolio";
import { apiResponse } from "@/lib/apiResponse";
import eventBus, { ADMIN_EVENTS } from "@/lib/eventBus";
import { portfolioData } from "@/lib/data";
import { getAuthSession } from "@/lib/auth";

const defaultSettings = {
    siteTitle: "Muhyo Tech",
    siteAccent: "Tech",
    siteTheme: "black",
    adminName: "Pir Ghulam Muhyo Din",
    email: "attariattari549@gmail.com",
    location: "Lahore, Pakistan",
    seo: {
        title: "Muhyo Tech - Full Stack Developer",
        description: "Full Stack Web Developer specializing in modern web applications",
    },
    ...(portfolioData.siteConfig || {}),
};

const sanitizePublicSettings = (settings = {}) => {
    const source = settings?.toObject ? settings.toObject() : settings;
    return {
        siteTitle: source.siteTitle || defaultSettings.siteTitle,
        siteAccent: source.siteAccent || defaultSettings.siteAccent,
        siteTheme: ["light", "dark", "black"].includes(source.siteTheme)
            ? source.siteTheme
            : defaultSettings.siteTheme,
        adminName: source.adminName || defaultSettings.adminName,
        email: source.email || defaultSettings.email,
        location: source.location || defaultSettings.location,
        seo: source.seo || defaultSettings.seo,
        socialLinks: source.socialLinks || defaultSettings.socialLinks || [],
        updatedAt: source.updatedAt || null,
    };
};

const isAdminSession = (session) =>
    ["super-admin", "root-super-admin", "admin"].includes(session?.role);

const noStore = (response) => {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    return response;
};

// GET /api/settings - Fetch current site configuration
export async function GET(request) {
    try {
        const themeOnly = new URL(request.url).searchParams.get("themeOnly") === "1";
        const session = await getAuthSession().catch(() => null);
        await dbConnect();

        // Get the site config (should be only one document)
        let config = await SiteConfig.findOne();

        // If no config exists, create default one
        if (!config) {
            config = new SiteConfig({
                siteTitle: "Muhyo Tech",
                siteAccent: "Tech",
                siteTheme: "black",
                adminName: "Pir Ghulam Muhyo Din",
                email: "attariattari549@gmail.com",
                location: "Lahore, Pakistan",
                seo: {
                    title: "Muhyo Tech - Full Stack Developer",
                    description: "Full Stack Web Developer specializing in modern web applications",
                },
            });
            await config.save();
        }

        const publicSettings = sanitizePublicSettings(config);
        const responseData = themeOnly
            ? { siteTheme: publicSettings.siteTheme, updatedAt: publicSettings.updatedAt }
            : (isAdminSession(session) ? config : publicSettings);

        return noStore(apiResponse.success(
            responseData,
            "Settings fetched successfully",
        ));
    } catch (error) {
        if (process.env.NODE_ENV !== "production") {
            console.warn("[settings] DB unavailable, using fallback settings");
        }
        const themeOnly = new URL(request.url).searchParams.get("themeOnly") === "1";
        const fallbackSettings = sanitizePublicSettings(defaultSettings);
        return noStore(apiResponse.success(
            themeOnly
                ? { siteTheme: fallbackSettings.siteTheme, updatedAt: null }
                : fallbackSettings,
            "Settings fallback loaded",
        ));
    }
}

// PATCH /api/settings - Update site configuration
export async function PATCH(request) {
    try {
        const session = await getAuthSession().catch(() => null);
        if (!isAdminSession(session)) {
            return apiResponse.error("Admin authorization required", 401);
        }

        await dbConnect();

        const data = await request.json();

        if (!data) {
            return apiResponse.error("No data provided", 400);
        }

        // Construct update object dynamically to avoid overwriting fields with undefined
        const updateData = {
            updatedAt: new Date(),
        };

        if (data.siteTitle) updateData.siteTitle = data.siteTitle;
        if (data.siteAccent) updateData.siteAccent = data.siteAccent;
        if (data.siteTheme !== undefined) {
            if (!["light", "dark", "black"].includes(data.siteTheme)) {
                return apiResponse.error("Invalid site theme", 400);
            }
            updateData.siteTheme = data.siteTheme;
        }
        if (data.adminName) updateData.adminName = data.adminName;
        if (data.email) updateData.email = data.email;
        if (data.location) updateData.location = data.location;
        if (data.seo) updateData.seo = data.seo;
        if (data.socialLinks) updateData.socialLinks = data.socialLinks;
        updateData.updatedBy = session.email;

        // Use findOneAndUpdate with upsert to ensure a document exists and is updated
        const savedConfig = await SiteConfig.findOneAndUpdate({}, // Empty filter to match the first (and only) document
            { $set: updateData }, {
                new: true, // Return the updated document
                upsert: true, // Create if doesn't exist
                runValidators: true,
                setDefaultsOnInsert: true,
            },
        );

        console.log("✅ Settings synchronized successfully");
        console.log("Collection:", savedConfig.constructor.modelName);
        console.log("Document ID:", savedConfig._id);

        // Emit socket event for real-time update
        try {
            eventBus.emit(ADMIN_EVENTS.SETTINGS_UPDATE, savedConfig.toObject());
            console.log("📡 Real-time settings event emitted via EventBus");
        } catch (ioError) {
            console.warn("Socket.io emit warning:", ioError.message);
            // Continue anyway - socket is optional
        }

        return noStore(apiResponse.success(
            savedConfig.toObject(),
            "Settings updated successfully",
        ));
    } catch (error) {
        console.error("❌ Settings update error:", error);
        return apiResponse.error("Failed to update settings", 500);
    }
}
