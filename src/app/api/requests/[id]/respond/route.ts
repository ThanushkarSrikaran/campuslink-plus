import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Request from "@/models/Request";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json(
        { message: "Message is required" },
        { status: 400 }
      );
    }
    await connectDB();
    await (Request as any).findByIdAndUpdate(id, {
      $push: {
        responses: {
          message,
          respondedBy: (session.user as any).id,
          createdAt: new Date(),
        },
      },
    });
    return NextResponse.json({ message: "Response added" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error adding response" },
      { status: 500 }
    );
  }
}