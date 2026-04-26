import mongoose, { Schema } from "mongoose";

const AppointmentSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mentorId: { type: Schema.Types.ObjectId, ref: "Mentor", required: true },
    moduleCode: { type: String, required: true, uppercase: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "booked", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    meetingLink: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);