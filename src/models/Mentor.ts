import mongoose, { Schema } from "mongoose";

const TimeSlotSchema = new Schema({
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true,
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const MentorSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bio: { type: String, trim: true, default: "" },
    modules: [{ type: String, uppercase: true, trim: true }],
    timeSlots: [TimeSlotSchema],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    availability: {
      type: String,
      enum: ["available", "busy", "in-session"],
      default: "available",
    },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Mentor ||
  mongoose.model("Mentor", MentorSchema);