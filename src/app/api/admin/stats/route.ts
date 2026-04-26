import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Resource from "@/models/Resource";
import Mentor from "@/models/Mentor";
import Appointment from "@/models/Appointment";
import Request from "@/models/Request";

export async function GET() {
  try {
    await connectDB();
    const [users, resources, mentors, appointments, sos] = await Promise.all([
      (User as any).countDocuments(),
      (Resource as any).countDocuments(),
      (Mentor as any).countDocuments(),
      (Appointment as any).countDocuments(),
      (Request as any).countDocuments(),
    ]);
    return NextResponse.json({ users, resources, mentors, appointments, sos });
  } catch (error) {
    return NextResponse.json(
      { users: 0, resources: 0, mentors: 0, appointments: 0, sos: 0 }
    );
  }
}