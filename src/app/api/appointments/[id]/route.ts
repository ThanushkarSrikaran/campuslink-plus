import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Notification from "@/models/Notification";
import { sendAppointmentConfirmationEmail } from "@/lib/mailer";

function generateMeetLink(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const seg = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `https://meet.google.com/${seg(3)}-${seg(4)}-${seg(3)}`;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    await connectDB();

    /* ── Accept flow ──────────────────────────────────────── */
    if (body.action === "accept") {
      const meetingLink = generateMeetLink();

      const appt = await (Appointment as any)
        .findByIdAndUpdate(id, { status: "confirmed", meetingLink }, { new: true })
        .populate("studentId", "name email")
        .populate({ path: "mentorId", populate: { path: "userId", select: "name email" } });

      if (!appt) return NextResponse.json({ message: "Appointment not found" }, { status: 404 });

      const studentName  = appt.studentId?.name  ?? "Student";
      const studentEmail = appt.studentId?.email;
      const mentorName   = appt.mentorId?.userId?.name  ?? "Mentor";
      const mentorEmail  = appt.mentorId?.userId?.email;

      // In-app notifications
      try {
        await Promise.all([
          (Notification as any).create({
            userId: appt.studentId._id,
            message: `Your session for ${appt.moduleCode} on ${appt.date} at ${appt.time} is confirmed! Check your email for the Google Meet link.`,
            type: "appointment",
            link: "/dashboard/appointments",
          }),
          (Notification as any).create({
            userId: appt.mentorId.userId._id,
            message: `You confirmed the session with ${studentName} for ${appt.moduleCode}. Google Meet link sent to both parties.`,
            type: "appointment",
            link: "/mentor-dashboard/appointments",
          }),
        ]);
      } catch (e) {
        console.error("Notification error:", e);
      }

      // Emails
      if (studentEmail && mentorEmail) {
        try {
          await sendAppointmentConfirmationEmail({
            studentEmail,
            studentName,
            mentorEmail,
            mentorName,
            moduleCode: appt.moduleCode,
            date: appt.date,
            time: appt.time,
            meetingLink,
          });
        } catch (e) {
          console.error("Email error:", e);
        }
      }

      return NextResponse.json({ message: "Session confirmed", meetingLink });
    }

    /* ── Decline flow ─────────────────────────────────────── */
    if (body.action === "decline") {
      const appt = await (Appointment as any)
        .findByIdAndUpdate(id, { status: "cancelled" }, { new: true })
        .populate("studentId", "name email")
        .populate({ path: "mentorId", populate: { path: "userId", select: "name email" } });

      if (appt?.studentId?._id) {
        try {
          await (Notification as any).create({
            userId: appt.studentId._id,
            message: `Your session request for ${appt.moduleCode} on ${appt.date} was declined by the mentor.`,
            type: "appointment",
            link: "/dashboard/appointments",
          });
        } catch (e) {
          console.error("Notification error:", e);
        }
      }

      return NextResponse.json({ message: "Session declined" });
    }

    /* ── Generic status update (in-progress, completed, cancelled) ── */
    await (Appointment as any).findByIdAndUpdate(id, { status: body.status });
    return NextResponse.json({ message: "Appointment updated" });
  } catch (error) {
    return NextResponse.json({ message: "Error updating appointment" }, { status: 500 });
  }
}
