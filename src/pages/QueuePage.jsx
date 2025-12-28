import { useEffect, useState } from "react";
import {
  collection, query, where,
  onSnapshot, doc, updateDoc, orderBy
} from "firebase/firestore";
import { auth, db } from "../firebase";
import "./QueuePage.css";

export default function QueuePage() {
  const [appointment, setAppointment] = useState(null);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q1 = query(
      collection(db, "appointments"),
      where("patientId", "==", auth.currentUser.uid),
      where("isActive", "==", true)
    );

    const unsub1 = onSnapshot(q1, snap => {
      if (!snap.empty) {
        setAppointment({ id: snap.docs[0].id, ...snap.docs[0].data() });
      }
    });

    const q2 = query(
      collection(db, "appointments"),
      where("status", "==", "ARRIVED"),
      orderBy("createdAt")
    );

    const unsub2 = onSnapshot(q2, snap => {
      setQueue(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  if (!appointment) return <p>Loading...</p>;

  const arrive = async () => {
    await updateDoc(doc(db, "appointments", appointment.id), {
      status: "ARRIVED",
    });
  };

  if (appointment.status === "COMPLETED") {
    return (
      <div className="queue-page">
        <div className="summary-card">
          <h2>Consultation Over ✅</h2>
          <p>Doctor: {appointment.doctorName}</p>
          <p>Problem: {appointment.problem}</p>
          <button onClick={() => window.location.href="/patient-details"}>
            Book New Appointment
          </button>
        </div>
      </div>
    );
  }

  const myPos = queue.findIndex(q => q.id === appointment.id) + 1;

  return (
    <div className="queue-page">
      <div className="summary-card">
        <h2>Patient Details</h2>
        <p>Name: {appointment.patientName}</p>
        <p>Doctor: {appointment.doctorName}</p>
        <p>Status: {appointment.status}</p>

        {appointment.status === "BOOKED" && (
          <label>
            <input type="checkbox" onChange={arrive} /> I have arrived
          </label>
        )}

        {appointment.status === "APPROVED" && (
          <p>🩺 Consultation Ongoing…</p>
        )}
      </div>

      {appointment.status === "ARRIVED" && (
        <div className="queue-card">
          <h2>Queue</h2>
          <p>Your Position: Q-{myPos}</p>

          {queue.map((p,i)=>(
            <div
              key={p.id}
              className={p.id===appointment.id ? "queue-person me":"queue-person"}
            >
              {p.id===appointment.id ? "YOU":"Patient"} – Q{i+1}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
