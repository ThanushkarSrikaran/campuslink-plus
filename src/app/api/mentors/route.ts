import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Mentor from "@/models/Mentor";

export async function GET() {
  try {
    await connectDB();
    const mentors = await (Mentor as any)
      .find({ status: "approved", isProfileComplete: true })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    return NextResponse.json({ mentors });
  } catch (error) {
    console.error("Mentors error:", error);
    return NextResponse.json(
      { message: "Error fetching mentors" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { bio, modules, timeSlots, userId } = await req.json();
    if (!bio || !modules || !timeSlots || !userId) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }
    await connectDB();
    const existing = await (Mentor as any).findOne({ userId });
    if (existing) {
      await (Mentor as any).findOneAndUpdate(
        { userId },
        {
          bio,
          modules,
          timeSlots,
          status: "approved",
          isProfileComplete: true,
          availability: "available",
        }
      );
    } else {
      await (Mentor as any).create({
        userId,
        bio,
        modules,
        timeSlots,
        status: "approved",
        isProfileComplete: true,
        availability: "available",
      });
    }
    return NextResponse.json({ message: "Profile updated" }, { status: 201 });
  } catch (error) {
    console.error("Mentor error:", error);
    return NextResponse.json(
      { message: "Error updating profile" },
      { status: 500 }
    );
  }
}