import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ notifications: [] });
    await connectDB();
    const notifications = await (Notification as any)
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ notifications: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, message, type, link } = await req.json();
    await connectDB();
    await (Notification as any).create({ userId, message, type, link });
    return NextResponse.json({ message: "Notification created" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating notification" },
      { status: 500 }
    );
  }
}