import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Mentor from "@/models/Mentor";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ mentor: null });
    }
    await connectDB();
    const mentor = await (Mentor as any).findOne({ userId }).populate("userId", "name email");
    return NextResponse.json({ mentor });
  } catch (error) {
    return NextResponse.json({ mentor: null });
  }
}