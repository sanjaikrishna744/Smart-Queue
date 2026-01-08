import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./DoctorDashboard.css";

const API = "http://localhost:5000";
const socket = io(API);

export default function DoctorDashboard() {
  const doctor = JSON.parse(sessionStorage.getItem("doctorSession"));
  const [session, setSession] = useState("morning");
  const [patients, setPatients] = useState([]);

  const load = async () => {
    const r = await fetch(
      `${API}/queue/doctor/${doctor.doctorId}?session=${session}`
    );
    const d = await r.json();
    setPatients(d.queue || []);
  };

  useEffect(() => {
    load();
    socket.on("QUEUE_UPDATE", load);
    return () => socket.off("QUEUE_UPDATE");
  }, [session]);

  const update = async (id, status) => {
    await fetch(`${API}/appointment/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  };

  const emergency = async () => {
    await fetch(`${API}/doctor/emergency`, { method: "POST" });
  };

  return (
    <div className="doctor-bg">
      <div className="doctor-glass">
        <h2>Doctor Dashboard</h2>

        <button className="emergency-btn" onClick={emergency}>
          🚨 Emergency Surgery
        </button>

        <div className="session-tabs">
          {["morning", "afternoon", "evening"].map((s) => (
            <button
              key={s}
              className={session === s ? "active" : ""}
              onClick={() => setSession(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {patients.map((p, i) => (
          <div key={p._id} className="patient-card">
            <b>Q-{i + 1} {p.patientName}</b>
            <p>Age: {p.patientAge}</p>
            <p>Problem: {p.patientProblem}</p>

            {p.status === "WAITING" && (
              <button onClick={() => update(p._id, "IN_PROGRESS")}>
                Call
              </button>
            )}
            {p.status === "IN_PROGRESS" && (
              <button onClick={() => update(p._id, "COMPLETED")}>
                End
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}