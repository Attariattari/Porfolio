import { NextResponse } from "next/server";
import { SubscriberController } from "@/controllers/SubscriberController";
import { getAuthSession } from "@/lib/auth";
import { sendNewsletterEmail } from "@/lib/newsletter";
import { Subscriber } from "@/models/Subscriber";
import { Blog, Service, Project } from "@/models/Portfolio";
import { NewsletterLog } from "@/models/NewsletterLog";
import dbConnect from "@/lib/dbConnect";

export async function POST(request) {
  try {
    const session = await getAuthSession();
    // Only Super Admin can send campaigns (as requested)
    if (!session || session.role !== "super-admin") {
      return NextResponse.json({ success: false, error: "Access Denied: Super Admin authority required." }, { status: 403 });
    }

    const body = await request.json();
    const { type, subject, message, selectedIds, recipients, targetId } = body;

    await dbConnect();
    
    // ⭐ PROFESSIONAL: Dynamically resolve Super Admin to exclude from newsletter
    const { getSuperAdminConfigWithFallback } = await import("@/lib/transferUtils");
    const { SiteConfig } = await import("@/models/Portfolio");
    const { superAdminEmail } = await getSuperAdminConfigWithFallback(dbConnect, SiteConfig);

    let targetSubscribers = [];

    if (recipients === 'selected') {
        if (!selectedIds || selectedIds.length === 0) {
            return NextResponse.json({ success: false, error: "No subscribers selected." }, { status: 400 });
        }
        targetSubscribers = await Subscriber.find({ 
            _id: { $in: selectedIds }, 
            isActive: true,
            email: { $ne: superAdminEmail }
        });
    } else {
        // 'all' active recipients, excluding Super Admin
        targetSubscribers = await Subscriber.find({ 
            isActive: true,
            email: { $ne: superAdminEmail }
        });
    }

    if (targetSubscribers.length === 0) {
        return NextResponse.json({ success: false, error: "No active subscribers found for this campaign." }, { status: 400 });
    }

    // Fetch actual content if required
    let newsletterData = {};
    if (type === 'manual') {
        newsletterData = { subject, message };
    } else if (targetId) {
        let content = null;
        if (type === 'blog') content = await Blog.findById(targetId).lean();
        if (type === 'service') content = await Service.findById(targetId).lean();
        if (type === 'project') content = await Project.findById(targetId).lean();
        
        if (!content) {
            return NextResponse.json({ success: false, error: `Specific ${type} not found.` }, { status: 404 });
        }
        newsletterData = content;
    } else {
        return NextResponse.json({ success: false, error: "No target intelligence selected." }, { status: 400 });
    }

    // Send the campaign
    // For specific IDs, we might need a modified version of sendNewsletterEmail or loop here
    // Let's use a simpler approach: loop through targetSubscribers and send
    
    // Actually, sendNewsletterEmail handles bulk by fetching all. 
    // Let's modify sendNewsletterEmail logic or just run it here for specific ones.
    
    // Initialize the Log
    const campaignLog = new NewsletterLog({
        subject,
        type,
        targetId: type !== 'manual' ? targetId : null,
        sentToCount: targetSubscribers.length,
        contentSummary: type === 'manual' ? message.substring(0, 500) : ''
    });
    await campaignLog.save();

    // Send the campaign asynchronously to avoid blocking the API response
    // NOTE: In a serverless environment, this might be interrupted. 
    // Ideally, this should be a background job.
    const executeCampaign = async () => {
        const results = {
            success: 0,
            failed: 0
        };

        const batchSize = 10;
        const targetIds = targetSubscribers.map(s => s._id);
        await SubscriberController.updateLastSent(targetIds);

        for (let i = 0; i < targetSubscribers.length; i += batchSize) {
            const batch = targetSubscribers.slice(i, i + batchSize);
            await Promise.all(batch.map(async (s) => {
                try {
                    await sendNewsletterEmail(type, { ...newsletterData, email: s.email }, false);
                    results.success++;
                } catch (err) {
                    console.error(`Failed to send to ${s.email}:`, err);
                    results.failed++;
                }
            }));
            // Batch delay
            await new Promise(r => setTimeout(r, 100));
        }

        // Update the log with final counts
        await NewsletterLog.findByIdAndUpdate(campaignLog._id, {
            successCount: results.success,
            failedCount: results.failed,
            sentAt: new Date()
        });
    };

    // Trigger execution without awaiting
    executeCampaign();

    return NextResponse.json({ 
        success: true, 
        message: `Campaign deployment initiated for ${targetSubscribers.length} nodes. Log ID: ${campaignLog._id.toString().slice(-6)}`,
        logId: campaignLog._id
    });

  } catch (error) {
    console.error("Newsletter Campaign Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
