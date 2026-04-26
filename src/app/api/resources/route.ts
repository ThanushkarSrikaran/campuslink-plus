import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Resource from "@/models/Resource";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const resources = await (Resource as any)
      .find({ status: "approved" })
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });
    return NextResponse.json({ resources });
  } catch (error) {
    console.error("Resources error:", error);
    return NextResponse.json(
      { message: "Error fetching resources" },
      { status: 500 }
    );
  }
}