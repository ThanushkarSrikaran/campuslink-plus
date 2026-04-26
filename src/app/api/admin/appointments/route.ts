import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

export async function GET() {
  try {
    await connectDB();
    const appointments = await (Appointment as any)
      .find({})
      .populate("studentId", "name email")
      .populate({
        path: "mentorId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 });
    return NextResponse.json({ appointments });
  } catch (error) {
    return NextResponse.json({ appointments: [] });
  }
}