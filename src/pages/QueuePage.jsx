import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./QueuePage.css";

const AVG_TIME = 5 * 60;

const JUNIOR_GPS = [
  { id: "10", name: "Dr. Arun" },
  { id: "11", name: "Dr. Divya" },
  { id: "12", name: "Dr. Sanjay" },
];

export default function QueuePage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [appointment, setAppointment] = useState(null);
  const [queue, setQueue] = useState([]);
  const [remaining, setRemaining] = useState(0);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showGPList, setShowGPList] = useState(false);

  const redirected = useRef(false);

  /* 🔥 PATIENT LISTENER */
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", auth.currentUser.uid),
      where("appointmentDate", "==", today),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    return onSnapshot(q, async (snap) => {
      if (snap.empty) return;

      const data = { id: snap.docs[0].id, ...snap.docs[0].data() };
      setAppointment(data);

      // 🚨 emergency
      if (data.doctorEmergency && data.isActive) {
        setShowEmergency(true);
      } else {
        setShowEmergency(false);
        setShowGPList(false);
      }

      // ✅ consultation end → redirect + close appointment
      if (data.status === "COMPLETED" && !redirected.current) {
        redirected.current = true;

        setTimeout(async () => {
          await updateDoc(doc(db, "appointments", data.id), {
            isActive: false,
          });
          navigate("/");
        }, 1000);
      }
    });
  }, [navigate, today]);

  /* 🔥 LIVE QUEUE */
  useEffect(() => {
    if (!appointment || !appointment.isActive) return;

    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", appointment.doctorId),
      where("session", "==", appointment.session),
      where("appointmentDate", "==", today),
      where("isActive", "==", true)
    );

    return onSnapshot(q, (snap) => {
      const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      raw.sort((a, b) => a.queueNumber - b.queueNumber);

      const unique = [];
      const seen = new Set();
      for (const p of raw) {
        if (!seen.has(p.patientId)) {
          seen.add(p.patientId);
          unique.push(p);
        }
      }

      setQueue(unique);

      const idx = unique.findIndex((p) => p.id === appointment.id);
      if (idx >= 0) setRemaining(idx * AVG_TIME);
    });
  }, [appointment, today]);

  /* ⏳ TIMER */
  useEffect(() => {
    if (!appointment || appointment.status !== "WAITING") return;
    const t = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [appointment]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  /* GP TRANSFER */
  const selectGP = async (gp) => {
    await updateDoc(doc(db, "appointments", appointment.id), {
      doctorId: gp.id,
      doctorName: gp.name,
      doctorEmergency: false,
    });

    setShowEmergency(false);
    setShowGPList(false);
  };

  if (!appointment) return <p>Loading…</p>;

  const myIndex = queue.findIndex((q) => q.id === appointment.id);

  return (
    <div className="queue-container">
      <div className="queue-card">
        <h2>Queue Status</h2>

        <p><b>Name:</b> {appointment.patientName}</p>
        <p><b>Age:</b> {appointment.patientAge}</p>
        <p><b>Problem:</b> {appointment.patientProblem}</p>
        <p><b>Doctor:</b> {appointment.doctorName}</p>

        <div className="token">Q-{Math.max(myIndex + 1, 1)}</div>
        <div>Patients before you: {Math.max(myIndex, 0)}</div>

        {appointment.status === "WAITING" && (
          <>
            <div className="timer">
              ⏳ {mins}:{secs.toString().padStart(2, "0")}
            </div>
            <div className="status waiting">Waiting for consultation</div>
          </>
        )}

        {appointment.status === "IN_PROGRESS" && (
          <div className="status warning">🩺 Consultation ongoing</div>
        )}
      </div>

      <div className="live-queue">
        <h3>Live Queue</h3>
        {queue.map((p, i) => (
          <div key={p.id} className="queue-row">
            <div>Q-{i + 1}</div>
            <div>{p.patientName}</div>
            <div>{p.patientAge}</div>
            <div>{p.patientProblem}</div>
          </div>
        ))}
      </div>

      {showEmergency && !showGPList && (
        <div className="right-slide">
          <h3>🚨 Doctor went to emergency</h3>
          <button onClick={() => setShowGPList(true)}>Consult Junior Doctor</button>
          <button onClick={() => setShowEmergency(false)}>Wait</button>
        </div>
      )}

      {showGPList && (
        <div className="right-slide">
          {JUNIOR_GPS.map((gp) => (
            <button key={gp.id} onClick={() => selectGP(gp)}>
              {gp.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}