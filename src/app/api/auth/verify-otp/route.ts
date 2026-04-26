import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import OTP from "@/models/OTP";
import User from "@/models/User";
import Notification from "@/models/Notification";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const otpRecord = await (OTP as any).findOne({ email });

    if (!otpRecord) {
      return NextResponse.json(
        { message: "OTP not found. Please register again." },
        { status: 400 }
      );
    }

    if (new Date() > otpRecord.expiresAt) {
      await (OTP as any).deleteOne({ email });
      return NextResponse.json(
        { message: "OTP has expired. Please register again." },
        { status: 400 }
      );
    }

    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { message: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    // Create the actual user
    const { name, password, role } = otpRecord.userData;
    const newUser = await (User as any).create({
      name,
      email,
      password,
      role,
    });

    // Send welcome notification
    await (Notification as any).create({
      userId: newUser._id,
      message: `Welcome to CampusLink+, ${name}! 🎓 Your account has been verified successfully.`,
      type: "system",
      link: role === "alumni" ? "/mentor-dashboard" : "/dashboard",
    });

    // Delete OTP record
    await (OTP as any).deleteOne({ email });

    return NextResponse.json(
      { message: "Account verified successfully! You can now login." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}