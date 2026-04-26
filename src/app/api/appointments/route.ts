import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Notification from "@/models/Notification";
import Mentor from "@/models/Mentor";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const mentorId = req.nextUrl.searchParams.get("mentorId");
    const query = mentorId ? { mentorId } : {};
    const appointments = await (Appointment as any)
      .find(query)
      .populate("studentId", "name email")
      .populate({
        path: "mentorId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 });
    return NextResponse.json({ appointments });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching appointments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { mentorId, moduleCode, date, time } = await req.json();
    if (!mentorId || !moduleCode || !date || !time) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check conflict — block if slot already pending/confirmed/in-progress
    const existing = await (Appointment as any).findOne({
      mentorId,
      date,
      time,
      status: { $in: ["pending", "confirmed", "booked", "in-progress"] },
    });
    if (existing) {
      return NextResponse.json(
        { message: "This time slot is already booked" },
        { status: 409 }
      );
    }

    const studentId = (session.user as any).id;

    await (Appointment as any).create({
      studentId,
      mentorId,
      moduleCode: moduleCode.toUpperCase(),
      date,
      time,
      status: "pending",
    });

    // Send notifications
    try {
      const mentor = await (Mentor as any).findById(mentorId);
      if (mentor?.userId) {
        await (Notification as any).create({
          userId: mentor.userId,
          message: `New session request for ${moduleCode} on ${date} at ${time} — please accept or decline.`,
          type: "appointment",
          link: "/mentor-dashboard/appointments",
        });
      }
      await (Notification as any).create({
        userId: studentId,
        message: `Your session request for ${moduleCode} on ${date} at ${time} has been sent. Awaiting mentor confirmation.`,
        type: "appointment",
        link: "/dashboard/appointments",
      });
    } catch (notifError) {
      console.error("Notification error:", notifError);
    }

    return NextResponse.json(
      { message: "Session request sent — awaiting mentor approval" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error booking appointment" },
      { status: 500 }
    );
  }
}