import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Subscriber } from "@/models/Subscriber";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const subscriber = await Subscriber.findOne({ email });

    if (!subscriber) {
      return NextResponse.json({ success: false, error: "Subscriber not found" }, { status: 404 });
    }

    if (!subscriber.isActive) {
      return new NextResponse(`
        <html>
          <body style="background-color: #03045e; color: #ffffff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center;">
            <div>
              <h1 style="color: #00b4d8;">Already Unsubscribed</h1>
              <p>Your email ${email} is already removed from our list.</p>
              <a href="/" style="color: #00b4d8; text-decoration: none;">Go back to Home</a>
            </div>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    // Return a simple HTML page confirming unsubscription
    return new NextResponse(`
      <html>
        <body style="background-color: #03045e; color: #ffffff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center;">
          <div>
            <h1 style="color: #00b4d8;">Unsubscribed Successfully</h1>
            <p>You have been removed from our newsletter list. We're sorry to see you go!</p>
            <a href="/" style="color: #00b4d8; text-decoration: none;">Go back to Home</a>
          </div>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });

  } catch (error) {
    console.error("Unsubscribe Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
