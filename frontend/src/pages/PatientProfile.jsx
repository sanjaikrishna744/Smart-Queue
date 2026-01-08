import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./PatientProfile.css";

export default function PatientProfile() {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("patientProfile");
    if (!stored) {
      navigate("/");
      return;
    }
    setProfile(JSON.parse(stored));
  }, [navigate]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setAppointments(snap.docs.map(d => d.data()));
    });

    return () => unsub();
  }, []);

  if (!profile) return null;

  const completed = appointments.filter(a => a.status === "COMPLETED");

  return (
    <div className="patient-profile-page">
      <div className="patient-profile-card">
        <h1>Patient Profile</h1>

        {/* BASIC INFO */}
        <div className="info-grid">
          <div><span>Name</span><p>{profile.name}</p></div>
          <div><span>Email</span><p>{profile.email}</p></div>
          <div><span>Age</span><p>{profile.age}</p></div>
          <div><span>Gender</span><p>{profile.gender}</p></div>
          <div><span>Phone</span><p>{profile.phone}</p></div>
        </div>

        <div className="divider" />

        {/* HISTORY */}
        <h3>Consultation History</h3>

        {completed.length === 0 && (
          <p className="muted">No completed consultations yet</p>
        )}

        {completed.map((a, i) => (
          <div key={i} className="history-card">
            <p><b>Doctor:</b> {a.doctorName}</p>
            <p><b>Problem:</b> {a.problem}</p>

            {a.doctorNotes && (
              <div className="note">
                <b>Doctor Notes</b>
                <p>{a.doctorNotes}</p>
              </div>
            )}

            {a.tablets && a.tablets.length > 0 && (
              <div className="tablets">
                <b>Tablets</b>
                <ul>
                  {a.tablets.map((t, idx) => (
                    <li key={idx}>💊 {t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        <button
          className="logout"
          onClick={() => {
            localStorage.removeItem("patientProfile");
            auth.signOut();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
