import mongoose, { Schema } from "mongoose";

const ResponseSchema = new Schema({
  message: { type: String, required: true },
  fileUrl: { type: String },
  respondedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const RequestSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    moduleCode: { type: String, required: true, uppercase: true },
    description: { type: String, required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["open", "fulfilled"], default: "open" },
    responses: [ResponseSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Request || mongoose.model("Request", RequestSchema);