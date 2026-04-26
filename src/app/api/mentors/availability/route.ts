import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Mentor from "@/models/Mentor";

export async function POST(req: NextRequest) {
  try {
    const { userId, availability } = await req.json();
    await connectDB();
    await (Mentor as any).findOneAndUpdate(
      { userId },
      { availability }
    );
    return NextResponse.json({ message: "Availability updated" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating availability" },
      { status: 500 }
    );
  }
}