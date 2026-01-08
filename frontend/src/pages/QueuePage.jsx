import { useEffect, useRef, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./QueuePage.css";

const API = "http://localhost:5000";
const AVG = 5 * 60;
const socket = io(API);

const JUNIOR_DOCTORS = [
  { id: "10", name: "Dr. Arun (GP)" },
  { id: "11", name: "Dr. Divya (GP)" },
  { id: "12", name: "Dr. Sanjay (GP)" },
];

export default function QueuePage() {
  const nav = useNavigate();
  const redirected = useRef(false);

  const [user, setUser] = useState(null);
  const [appt, setAppt] = useState(null);
  const [queue, setQueue] = useState([]);
  const [showThanks, setShowThanks] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [showGP, setShowGP] = useState(false);

  // 🔐 AUTH
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) nav("/login");
      else setUser(u);
    });
  }, []);

  // 🔄 LOAD DATA (🔥 MAIN FIX)
  const load = async (uid) => {
    const p = await fetch(`${API}/queue/patient/${uid}`);
    const pd = await p.json();
    if (!pd.appointment) return;

    const appointment = pd.appointment;
    setAppt(appointment);

    // 🔥 COMPLETED HANDLING HERE (NOT in useEffect)
    if (appointment.status === "COMPLETED") {
      setQueue([]);

      if (!redirected.current) {
        redirected.current = true;
        setShowThanks(true);

        setTimeout(() => {
          nav("/");
        }, 5000);
      }
      return;
    }

    // 🧠 LOAD QUEUE ONLY IF ACTIVE
    const q = await fetch(
      `${API}/queue/doctor/${appointment.doctorId}?session=${appointment.session}`
    );
    const qd = await q.json();
    setQueue(qd.queue || []);
  };

  // 🔔 SOCKET LISTENERS
  useEffect(() => {
    if (!user) return;

    load(user.uid);

    socket.on("QUEUE_UPDATE", () => load(user.uid));
    socket.on("DOCTOR_EMERGENCY", () => setEmergency(true));

    return () => {
      socket.off("QUEUE_UPDATE");
      socket.off("DOCTOR_EMERGENCY");
    };
  }, [user]);

  if (!appt) return <p>Loading...</p>;

  const idx = queue.findIndex((q) => q._id === appt._id);
  const waitingTime = idx > 0 ? idx * AVG : 0;

  // 🔁 TRANSFER TO GP
  const transfer = async (gp) => {
    await fetch(`${API}/appointment/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: appt._id,
        doctorId: gp.id,
        doctorName: gp.name,
      }),
    });

    setEmergency(false);
    setShowGP(false);
  };

  return (
    <div className="queue-container">
      {/* LEFT */}
      <div className="queue-card">
        <h2>Queue Status</h2>

        <p>Name: {appt.patientName}</p>
        <p>Age: {appt.patientAge}</p>
        <p>Problem: {appt.patientProblem}</p>
        <p>Doctor: {appt.doctorName}</p>

        {/* ✅ COMPLETED */}
        {showThanks && (
          <div className="status success">
            🙏 Consultation Over <br />
            Thanks for coming <br />
            Redirecting to home…
          </div>
        )}

        {/* 🟠 IN PROGRESS */}
        {!showThanks && appt.status === "IN_PROGRESS" && (
          <>
            <div className="token active">Now Consulting</div>
            <div className="status warning">Consultation ongoing</div>
          </>
        )}

        {/* 🟡 WAITING */}
        {!showThanks && appt.status === "WAITING" && idx >= 0 && (
          <>
            <div className="token">Q-{idx + 1}</div>
            <div>Patients before you: {idx}</div>
            <div className="timer">
              ⏳ {Math.floor(waitingTime / 60)}:
              {String(waitingTime % 60).padStart(2, "0")}
            </div>
            <div className="status waiting">Waiting</div>
          </>
        )}
      </div>

      {/* RIGHT – LIVE QUEUE */}
      <div className="live-queue">
        <h3>Live Queue</h3>

        {queue.length === 0 && <p>No active patients</p>}

        {queue.map((p, i) => (
          <div key={p._id} className="queue-row">
            <b>Q-{i + 1} {p.patientName}</b>
            <div className="sub">
              Age: {p.patientAge} | {p.patientProblem}
            </div>
            <span className="tag">{p.priorityType}</span>
          </div>
        ))}
      </div>

      {/* 🚨 EMERGENCY SLIDE */}
      {emergency && !showGP && (
        <div className="right-slide">
          <h3>🚨 Doctor went to emergency surgery</h3>
          <button onClick={() => setShowGP(true)}>
            Consult Junior Doctor
          </button>
          <button onClick={() => setEmergency(false)}>Wait</button>
        </div>
      )}

      {showGP && (
        <div className="right-slide">
          <h3>Select Junior Doctor</h3>
          {JUNIOR_DOCTORS.map((gp) => (
            <button key={gp.id} onClick={() => transfer(gp)}>
              {gp.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}