import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    await connectDB();
    await (Notification as any).updateMany(
      { userId, read: false },
      { read: true }
    );
    return NextResponse.json({ message: "Marked as read" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error marking as read" },
      { status: 500 }
    );
  }
}