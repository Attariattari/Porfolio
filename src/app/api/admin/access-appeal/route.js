import { NextResponse } from "next/server";
import User, { Notification } from "@/models/AdminModels";
import dbConnect from "@/lib/dbConnect";
import eventBus, { ADMIN_EVENTS } from "@/lib/eventBus";
import { jwtVerify } from "jose";
import { getAuthSecretKey } from "@/lib/authSecret";

const SECRET = getAuthSecretKey();

async function verifyAppealToken(token, email) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.purpose === "access-appeal" && payload.email === email;
  } catch {
    return false;
  }
}

export async function GET(request) {
  const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase();
  const token = new URL(request.url).searchParams.get("token");
  if (!email) return NextResponse.json({ success: false, message: "Email is required." }, { status: 400 });
  if (!(await verifyAppealToken(token, email))) return NextResponse.json({ success: false, message: "Appeal session expired. Please sign in again." }, { status: 401 });
  await dbConnect();
  const user = await User.findOne({ email }).select("status accessAppeal accessRestriction").lean();
  if (!user) return NextResponse.json({ success: false, message: "Account not found." }, { status: 404 });
  return NextResponse.json({ success: true, status: user.status, appealStatus: user.accessAppeal?.status || null, restrictionReason: user.accessRestriction?.reason || null });
}

export async function POST(request) {
  const { email: rawEmail, message: rawMessage, token } = await request.json();
  const email = rawEmail?.trim().toLowerCase();
  const message = rawMessage?.trim();
  if (!email || !message || message.length < 20 || message.length > 1500) {
    return NextResponse.json({ success: false, message: "Please provide an appeal between 20 and 1500 characters." }, { status: 400 });
  }
  if (!(await verifyAppealToken(token, email))) return NextResponse.json({ success: false, message: "Appeal session expired. Please sign in again." }, { status: 401 });
  await dbConnect();
  const user = await User.findOne({ email, status: "restricted" });
  if (!user) return NextResponse.json({ success: false, message: "This account is not currently restricted." }, { status: 409 });
  if (user.accessAppeal?.status === "pending") return NextResponse.json({ success: false, message: "An appeal is already awaiting review." }, { status: 409 });

  user.accessAppeal = { message, status: "pending", submittedAt: new Date() };
  await user.save();
  const notification = await Notification.create({ type: "ACCESS_APPEAL", title: "Access restoration appeal", message: `${user.name || email} requested account access restoration.`, status: "unread", relatedUserId: user._id });
  eventBus.emit(ADMIN_EVENTS.NOTIFICATION, notification);
  eventBus.emit(ADMIN_EVENTS.USER_UPDATE, { email, status: "restricted", appealStatus: "pending" });
  return NextResponse.json({ success: true, appealStatus: "pending" });
}
