import mongoose, { Schema } from "mongoose";

const ResourceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    moduleCode: { type: String, required: true, trim: true },
    year: { type: String, required: true },
    type: { type: String, enum: ["paper", "notes"], required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ["pdf", "jpeg"], required: true },
    publicId: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    description: { type: String, trim: true },
    contentText: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);