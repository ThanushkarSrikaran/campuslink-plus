import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Mentor from "@/models/Mentor";

export async function GET() {
  try {
    await connectDB();
    const mentors = await (Mentor as any)
      .find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    return NextResponse.json({ mentors });
  } catch (error) {
    return NextResponse.json({ mentors: [] });
  }
}