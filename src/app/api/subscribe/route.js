import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Subscriber } from "@/models/Subscriber";
import { sendNewsletterEmail } from "@/lib/newsletter";
import { emitSocketEvent, SOCKET_EVENTS } from "@/lib/socket";

export async function POST(request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
    }

    // Check if duplicate
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ success: false, error: "Email already subscribed" }, { status: 400 });
      } else {
        // Re-activate if previously unsubscribed
        existing.isActive = true;
        existing.subscribedAt = new Date();
        existing.unsubscribedAt = null;
        await existing.save();
        // Send welcome email also for re-activation
        await sendNewsletterEmail('welcome', { email: existing.email }, false);
        return NextResponse.json({ success: true, message: "Subscription re-activated successfully" });
      }
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    // Emit real-time update for admin dashboard
    emitSocketEvent(SOCKET_EVENTS.NEW_SUBSCRIBER, { email: newSubscriber.email });

    // Send professional welcome email
    await sendNewsletterEmail('welcome', { email: newSubscriber.email }, false);

    return NextResponse.json({ 
      success: true, 
      message: "Thank you for subscribing to our newsletter!" 
    });
  } catch (error) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
