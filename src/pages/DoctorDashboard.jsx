import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./DoctorDashboard.css";

export default function DoctorDashboard() {
  const doctor = JSON.parse(sessionStorage.getItem("doctorSession"));
  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();

  const [session, setSession] = useState("Morning (9AM - 12PM)");
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    if (!doctor) return;

    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", String(doctor.id)),
      where("appointmentDate", "==", today),
      where("isActive", "==", true)
    );

    return onSnapshot(q, (snap) => {
      const map = new Map();

      snap.docs.forEach((d) => {
        const data = { id: d.id, ...d.data() };
        if (!map.has(data.patientId)) {
          map.set(data.patientId, data);
        }
      });

      setPatients(
        Array.from(map.values()).sort(
          (a, b) => a.queueNumber - b.queueNumber
        )
      );
    });
  }, [doctor, today]);

  const sessionPatients = patients.filter((p) => p.session === session);

  const callPatient = (p) => {
    navigate("/doctor-consult", {
      state: { appointmentId: p.id },
    });
  };

  return (
    <div className="doctor-bg">
      <div className="doctor-glass">
        <h2>Doctor Dashboard</h2>

        <div className="session-bar">
          <button onClick={() => setSession("Morning (9AM - 12PM)")}>Morning</button>
          <button onClick={() => setSession("Afternoon (12PM - 4PM)")}>Afternoon</button>
          <button onClick={() => setSession("Evening (4PM - 8PM)")}>Evening</button>
        </div>

        <button onClick={() => navigate("/doctor-emergency")}>
          🚨 Emergency
        </button>

        {sessionPatients.map((p, i) => (
          <div key={p.id} className="patient-card">
            <b>Q-{i + 1} {p.patientName}</b>
            <p>Age: {p.patientAge}</p>
            <p>Problem: {p.patientProblem}</p>

            {p.status === "WAITING" && (
              <button onClick={() => callPatient(p)}>Call</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}