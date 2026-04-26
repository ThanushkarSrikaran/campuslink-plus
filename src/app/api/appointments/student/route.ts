import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

export async function GET(req: NextRequest) {
  try {
    const studentId = req.nextUrl.searchParams.get("studentId");
    if (!studentId) {
      return NextResponse.json({ appointments: [] });
    }
    await connectDB();
    const appointments = await (Appointment as any)
      .find({ studentId })
      .populate({
        path: "mentorId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 });
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Student appointments error:", error);
    return NextResponse.json(
      { message: "Error fetching appointments" },
      { status: 500 }
    );
  }
}