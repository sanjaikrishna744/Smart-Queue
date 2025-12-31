import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import "./DoctorDashboard.css";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [doctorName, setDoctorName] = useState("");

  // NEW STATE (ONLY UI)
  const [notes, setNotes] = useState("");
  const [tablets, setTablets] = useState("");

  useEffect(() => {
    const session = sessionStorage.getItem("doctorSession");
    if (!session) return;
    setDoctorName(JSON.parse(session).doctorName);
  }, []);

  useEffect(() => {
    if (!doctorName) return;

    const q = query(
      collection(db, "appointments"),
      where("doctorName", "==", doctorName),
      where("isActive", "==", true)
    );

    const unsub = onSnapshot(q, (snap) => {
      setAppointments(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, [doctorName]);

  const approvePatient = async (id) => {
    await updateDoc(doc(db, "appointments", id), {
      status: "APPROVED",
    });
  };

  const completeConsultation = async (id) => {
    await updateDoc(doc(db, "appointments", id), {
      status: "COMPLETED",

      // 👇 NEW DATA (SAFE)
      doctorNotes: notes,
      tablets: tablets
        .split(",")
        .map(t => t.trim())
        .filter(Boolean),
    });

    setNotes("");
    setTablets("");

    setTimeout(async () => {
      await updateDoc(doc(db, "appointments", id), {
        isActive: false,
      });
    }, 3000);
  };

  return (
    <div className="doctor-dashboard">
      {/* HEADER */}
      <div className="doctor-header">
        <div>
          <h1>Doctor Dashboard</h1>
          <p className="sub">{doctorName}</p>
        </div>

        <div className="stats">
          <div>
            <span>Active Patients</span>
            <b>{appointments.length}</b>
          </div>
          <div>
            <span>Status</span>
            <b className="online">Online</b>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="patient-grid">
        {appointments.length === 0 && (
          <div className="empty">🩺 No patients waiting right now</div>
        )}

        {appointments.map((a) => (
          <div key={a.id} className="patient-card">
            <div className="patient-top">
              <h3>{a.patientName}</h3>
              <span className={`badge ${a.status.toLowerCase()}`}>
                {a.status}
              </span>
            </div>

            <p className="problem">{a.problem}</p>

            {/* ONLY WHEN APPROVED */}
            {a.status === "APPROVED" && (
              <>
                <textarea
                  placeholder="Doctor notes (eg: Take rest, avoid mobile)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <input
                  placeholder="Tablets (comma separated)"
                  value={tablets}
                  onChange={(e) => setTablets(e.target.value)}
                />
              </>
            )}

            <div className="actions">
              {(a.status === "BOOKED" || a.status === "ARRIVED") && (
                <button
                  className="approve"
                  onClick={() => approvePatient(a.id)}
                >
                  Approve
                </button>
              )}

              {a.status === "APPROVED" && (
                <button
                  className="complete"
                  onClick={() => completeConsultation(a.id)}
                >
                  Consultation Over
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
