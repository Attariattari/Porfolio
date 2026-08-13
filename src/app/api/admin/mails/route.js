import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { SystemEmail } from "@/models/SystemEmail";
import User from "@/models/AdminModels";
import { sendEmail } from "@/lib/mailer";

async function isSuperAdmin() {
  const session = await getAuthSession();
  if (!session) return false;
  return ["super-admin", "root-super-admin"].includes(session.role);
}

export async function GET(request) {
  try {
    const session = await getAuthSession();
    if (!session || !["super-admin", "root-super-admin"].includes(session.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized. Super Admin access required." }, { status: 403 });
    }

    await dbConnect();

    const emails = await SystemEmail.find()
      .sort({ createdAt: -1 })
      .limit(150)
      .lean();

    const pendingAppeals = await User.find({ "accessAppeal.status": "pending" })
      .select("email name role status accessRestriction accessAppeal createdAt")
      .sort({ "accessAppeal.submittedAt": -1 })
      .lean();

    return NextResponse.json({
      success: true,
      emails: emails || [],
      appeals: pendingAppeals || [],
    });
  } catch (error) {
    console.error("[Admin Mails API Error]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!session || !["super-admin", "root-super-admin"].includes(session.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized. Super Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const { action } = body;

    if (action === "send_reply") {
      const { to, subject, message } = body;

      if (!to || !subject || !message) {
        return NextResponse.json({ success: false, message: "Missing required email fields (to, subject, message)." }, { status: 400 });
      }

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #090d16; color: #f3f4f6; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
            <h2 style="color: #6366f1; margin: 0; font-size: 20px;">Muhyo Tech Support Response</h2>
          </div>
          <div style="font-size: 15px; line-height: 1.6; color: #e5e7eb;">
            ${message.replace(/\n/g, "<br/>")}
          </div>
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #9ca3af;">
            <p style="margin: 0;">Sent by Super Admin (${session.email}) via Muhyo Tech Control Center.</p>
          </div>
        </div>
      `;

      const result = await sendEmail({
        to,
        subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
        html: htmlContent,
        text: message,
        type: "admin_reply",
        metadata: { repliedBy: session.email },
      });

      if (!result.success) {
        return NextResponse.json({ success: false, message: result.error }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Reply sent successfully!" });
    }

    if (action === "handle_appeal") {
      const { userId, appealAction } = body; // appealAction: 'approve' or 'reject'

      if (!userId || !["approve", "reject"].includes(appealAction)) {
        return NextResponse.json({ success: false, message: "Invalid parameters." }, { status: 400 });
      }

      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
      }

      if (appealAction === "approve") {
        user.status = "approved";
        user.accessRestriction = undefined;
        user.accessAppeal = {
          ...user.accessAppeal,
          status: "approved",
          reviewedAt: new Date(),
          reviewedBy: session.email,
        };
        await user.save();

        // Notify user via email
        await sendEmail({
          to: user.email,
          subject: "Account Access Restored - Muhyo Tech",
          type: "account_restore",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 10px;">
              <h2 style="color: #22c55e;">Account Restored!</h2>
              <p>Hello ${user.name || user.email},</p>
              <p>Your access restore request has been approved by our Super Admin team. You can now log into your account again.</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.muhyotech.com'}/admin/login" style="display: inline-block; background-color: #6366f1; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 12px;">Login Now</a>
            </div>
          `,
        });

        return NextResponse.json({ success: true, message: `Access restored for ${user.email}.` });
      } else {
        user.accessAppeal = {
          ...user.accessAppeal,
          status: "rejected",
          reviewedAt: new Date(),
          reviewedBy: session.email,
        };
        await user.save();

        // Notify user via email
        await sendEmail({
          to: user.email,
          subject: "Account Restore Request Update - Muhyo Tech",
          type: "account_restore",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 10px;">
              <h2 style="color: #ef4444;">Appeal Decision Update</h2>
              <p>Hello ${user.name || user.email},</p>
              <p>Your account access appeal was reviewed, but your restriction remains in place at this time.</p>
            </div>
          `,
        });

        return NextResponse.json({ success: true, message: `Appeal rejected for ${user.email}.` });
      }
    }

    return NextResponse.json({ success: false, message: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("[Admin Mails POST API Error]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
