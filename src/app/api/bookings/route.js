import { NextResponse } from "next/server";
import { z } from "zod";
import { BookingController } from "@/controllers/BookingController";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

const optionalText = (max = 500) =>
  z
    .string()
    .max(max)
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || "");

const BookingRequestSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255).trim().toLowerCase(),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^[+\d\s().-]{7,24}$/.test(value), "Invalid phone number")
    .transform((value) => value || ""),
  serviceSlug: z.string().min(1).max(120).trim(),
  serviceTitle: optionalText(160),
  preferredDate: z.string().min(1).max(40).trim(),
  preferredTime: z.string().min(1).max(40).trim(),
  projectType: z.string().min(1).max(120).trim(),
  timelinePreference: optionalText(80),
  contactPreference: optionalText(80),
  message: z.string().min(10).max(5000).trim(),
  source: optionalText(80),
  sourcePage: optionalText(120),
  contextTitle: optionalText(180),
  website: optionalText(200),
});

export async function POST(req) {
  try {
    const clientIP = getClientIP(req);
    const rateLimit = await checkRateLimit(`booking:${clientIP}`, {
      maxRequests: 4,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many booking attempts. Please try again later." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const parsed = BookingRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Please check the booking details and try again." },
        { status: 400 },
      );
    }

    if (parsed.data.website) {
      return NextResponse.json(
        { success: false, message: "Please check the booking details and try again." },
        { status: 400 },
      );
    }

    const booking = await BookingController.create(parsed.data);

    return NextResponse.json({
      success: true,
      message:
        "Your booking request has been submitted successfully. I'll review your project details and get back to you as soon as possible.",
      data: booking,
    });
  } catch (error) {
    console.error("[API Bookings] Error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to submit booking request right now." },
      { status: 500 },
    );
  }
}
