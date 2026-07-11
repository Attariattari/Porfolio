import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Subscriber } from "@/models/Subscriber";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderUnsubscribePage({ title, message }) {
  return `
    <html>
      <head>
        <style>
          body {
            align-items: center;
            background-color: #03045e;
            color: #ffffff;
            display: flex;
            font-family: sans-serif;
            height: 100vh;
            justify-content: center;
            text-align: center;
          }
          h1,
          a {
            color: #00b4d8;
          }
          a {
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(message)}</p>
          <a href="/">Go back to Home</a>
        </div>
      </body>
    </html>
  `;
}

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
      return new NextResponse(
        renderUnsubscribePage({
          title: "Already Unsubscribed",
          message: `Your email ${email} is already removed from our list.`,
        }),
        { headers: { 'Content-Type': 'text/html' } },
      );
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    // Return a simple HTML page confirming unsubscription
    return new NextResponse(
      renderUnsubscribePage({
        title: "Unsubscribed Successfully",
        message: "You have been removed from our newsletter list. We're sorry to see you go!",
      }),
      { headers: { 'Content-Type': 'text/html' } },
    );

  } catch (error) {
    console.error("Unsubscribe Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
