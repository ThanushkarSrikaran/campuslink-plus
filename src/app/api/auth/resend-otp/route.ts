import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import OTP from "@/models/OTP";
import { sendOTPEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    await connectDB();

    const otpRecord = await (OTP as any).findOne({ email });
    if (!otpRecord) {
      return NextResponse.json(
        { message: "No pending registration found" },
        { status: 400 }
      );
    }

    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();

    await (OTP as any).findOneAndUpdate(
      { email },
      {
        otp: newOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      }
    );

    await sendOTPEmail(email, otpRecord.userData.name, newOtp);

    return NextResponse.json({ message: "New OTP sent!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error resending OTP" },
      { status: 500 }
    );
  }
}