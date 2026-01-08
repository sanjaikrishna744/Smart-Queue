import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: String,
    patientName: String,
    patientAge: Number,
    patientProblem: String,

    doctorId: String,
    doctorName: String,

    session: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
    },

    priorityType: {
      type: String,
      enum: ["E1", "E2", "E3", "OPD"],
      default: "OPD",
    },

    status: {
      type: String,
      enum: ["WAITING", "IN_PROGRESS", "COMPLETED"],
      default: "WAITING",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", AppointmentSchema);