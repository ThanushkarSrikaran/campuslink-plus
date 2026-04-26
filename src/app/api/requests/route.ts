import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Request from "@/models/Request";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const requests = await (Request as any)
      .find({})
      .populate("postedBy", "name")
      .populate("responses.respondedBy", "name")
      .sort({ createdAt: -1 });
    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching requests" },
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

    const { title, moduleCode, description } = await req.json();
    if (!title || !moduleCode || !description) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }
    await connectDB();
    await (Request as any).create({
      title,
      moduleCode: moduleCode.toUpperCase(),
      description,
      postedBy: (session.user as any).id,
      status: "open",
      responses: [],
    });
    return NextResponse.json(
      { message: "Request created" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating request" },
      { status: 500 }
    );
  }
}