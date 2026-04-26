import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Resource from "@/models/Resource";
import cloudinary from "@/lib/cloudinary";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const moduleCode = formData.get("moduleCode") as string;
    const year = formData.get("year") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;
    const tags = formData.get("tags") as string;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const isPdf = file.type.includes("pdf");
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "campuslink",
      resource_type: isPdf ? "raw" : "image",
    });

    await connectDB();
    await (Resource as any).create({
      title,
      moduleCode: moduleCode.toUpperCase(),
      year,
      type,
      description,
      tags: tags ? tags.split(",").map((t: string) => t.trim()) : [],
      fileUrl: result.secure_url,
      fileType: isPdf ? "pdf" : "jpeg",
      publicId: result.public_id,
      uploadedBy: (session.user as any).id,
      status: "approved",
    });

    return NextResponse.json(
      { message: "Uploaded successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}