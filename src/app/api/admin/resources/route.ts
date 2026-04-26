import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Resource from "@/models/Resource";

export async function GET() {
  try {
    await connectDB();
    const resources = await (Resource as any)
      .find({})
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });
    return NextResponse.json({ resources });
  } catch (error) {
    return NextResponse.json({ resources: [] });
  }
}