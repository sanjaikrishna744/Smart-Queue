import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import Appointment from "./models/Appointment.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// ================= MONGODB =================
mongoose
  .connect(
    "mongodb+srv://smartqueue:smartqueue744@cluster0.0vqlsb9.mongodb.net/smartqueue"
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error", err));

// ================= SOCKET =================
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);
});

const emitUpdate = () => io.emit("QUEUE_UPDATE");

// ================= BOOK =================
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

// ================= PATIENT =================
app.get("/queue/patient/:uid", async (req, res) => {
  const appt = await Appointment.findOne({
    patientId: req.params.uid,
    status: { $in: ["WAITING", "IN_PROGRESS", "COMPLETED"] }
  }).sort({ createdAt: -1 });

  res.json({ appointment: appt });
});

// ================= DOCTOR =================
app.get("/queue/doctor/:doctorId", async (req, res) => {
  const { session } = req.query;

  const queue = await Appointment.find({
    doctorId: req.params.doctorId,
    session,
    status: { $ne: "COMPLETED" },
  }).sort({ createdAt: 1 });

  res.json({ queue });
});

// ================= STATUS UPDATE =================
app.post("/appointment/status", async (req, res) => {
  const { id, status } = req.body;

  const appt = await Appointment.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  io.emit("QUEUE_UPDATE");

  // 🔥 AUTO CLEANUP AFTER COMPLETED
  if (status === "COMPLETED") {
    setTimeout(async () => {
      await Appointment.findByIdAndDelete(id);
      io.emit("QUEUE_UPDATE");
    }, 6000); // 6 seconds
  }

  res.json({ success: true });
});

// ================= EMERGENCY =================
app.post("/doctor/emergency", async (req, res) => {
  io.emit("DOCTOR_EMERGENCY");
  res.json({ success: true });
});

// ================= TRANSFER =================
app.post("/appointment/transfer", async (req, res) => {
  const { id, doctorId, doctorName } = req.body;

  await Appointment.findByIdAndUpdate(id, {
    doctorId,
    doctorName,
  });

  emitUpdate();
  res.json({ success: true });
});

server.listen(5000, () =>
  console.log("🔥 Smart Queue backend + socket running on 5000")
);