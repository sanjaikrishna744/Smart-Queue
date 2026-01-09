process.env.GEMINI_API_KEY ="AIzaSyCx-Dy3ALBXFBIaoGox2fFP2Abzzlqu3fk";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";



import Appointment from "./models/Appointment.js";
import ConsultationHistory from "./models/ConsultationHistory.js";

const app = express();
const server = http.createServer(app);

/* ================= SOCKET ================= */
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

/* ================= MONGODB ================= */
mongoose
  .connect(
    "mongodb+srv://smartqueue:smartqueue744@cluster0.0vqlsb9.mongodb.net/smartqueue"
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error", err));

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);
});

const emitUpdate = () => io.emit("QUEUE_UPDATE");

/* ================= BOOK ================= */
app.post("/queue/book", async (req, res) => {
  const existing = await Appointment.findOne({
    patientId: req.body.patientId,
    status: { $ne: "COMPLETED" },
  });

  if (existing) {
    return res.json({ success: true, appointment: existing });
  }

  const appt = await Appointment.create({
    ...req.body,
    status: "WAITING",
  });

  emitUpdate();
  res.json({ success: true, appointment: appt });
});

/* ================= PATIENT ================= */
app.get("/queue/patient/:uid", async (req, res) => {
  const appt = await Appointment.findOne({
    patientId: req.params.uid,
    status: { $in: ["WAITING", "IN_PROGRESS", "COMPLETED"] },
  }).sort({ createdAt: -1 });

  res.json({ appointment: appt });
});

/* ================= DOCTOR QUEUE ================= */
app.get("/queue/doctor/:doctorId", async (req, res) => {
  const { session } = req.query;

  const queue = await Appointment.aggregate([
    {
      $match: {
        doctorId: req.params.doctorId,
        session,
        status: { $ne: "COMPLETED" },
      },
    },
    {
      $addFields: {
        priorityRank: {
          $switch: {
            branches: [
              { case: { $eq: ["$priorityType", "E1"] }, then: 1 },
              { case: { $eq: ["$priorityType", "E2"] }, then: 2 },
              { case: { $eq: ["$priorityType", "E3"] }, then: 3 },
            ],
            default: 4, // OPD
          },
        },
      },
    },
    {
      $sort: { priorityRank: 1, createdAt: 1 },
    },
  ]);

  res.json({ queue });
});

/* ================= STATUS UPDATE ================= */
app.post("/appointment/status", async (req, res) => {
  const { id, status } = req.body;

  const appt = await Appointment.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  emitUpdate();

  if (status === "COMPLETED" && appt) {
    await ConsultationHistory.create({
      patientId: appt.patientId,
      patientName: appt.patientName,
      patientAge: appt.patientAge,
      patientProblem: appt.patientProblem,
      doctorId: appt.doctorId,
      doctorName: appt.doctorName,
      priorityType: appt.priorityType,
      session: appt.session,
    });
  }

  res.json({ success: true });
});

/* ================= EMERGENCY ================= */
app.post("/doctor/emergency", (req, res) => {
  io.emit("DOCTOR_EMERGENCY");
  res.json({ success: true });
});

/* ================= TRANSFER ================= */
app.post("/appointment/transfer", async (req, res) => {
  const { id, doctorId, doctorName } = req.body;

  await Appointment.findByIdAndUpdate(id, {
    doctorId,
    doctorName,
  });

  emitUpdate();
  res.json({ success: true });
});

/* ================= PATIENT HISTORY ================= */
app.get("/patient/history/:uid", async (req, res) => {
  try {
    const history = await Appointment.find({
      patientId: req.params.uid,
      status: "COMPLETED",
    }).sort({ updatedAt: -1 });

    res.json({ history });
  } catch {
    res.status(500).json({ history: [] });
  }
});




/* ================= START SERVER ================= */
server.listen(5000, () =>
  console.log("🔥 Smart Queue backend + Gemini running on 5000")
);