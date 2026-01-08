import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./DoctorProfile.css";

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const session = sessionStorage.getItem("doctorSession");
    if (!session) {
      navigate("/");
      return;
    }
    setDoctor(JSON.parse(session));
  }, [navigate]);

  useEffect(() => {
    if (!doctor) return;

    const q = query(
      collection(db, "appointments"),
      where("doctorName", "==", doctor.doctorName)
    );

    const unsub = onSnapshot(q, (snap) => {
      setAppointments(snap.docs.map(d => d.data()));
    });

    return () => unsub();
  }, [doctor]);

  if (!doctor) return null;

  const approved = appointments.filter(a => a.status === "APPROVED");
  const completed = appointments.filter(a => a.status === "COMPLETED");

  return (
    <div className="doctor-profile">
      <div className="doctor-card">
        <h1>Doctor Profile</h1>
        <h2>{doctor.doctorName}</h2>
        <p className="spec">{doctor.speciality}</p>

        <div className="stats">
          <div>
            <b>{appointments.length}</b>
            <span>Total Patients</span>
          </div>
          <div>
            <b>{approved.length}</b>
            <span>Approved</span>
          </div>
          <div>
            <b>{completed.length}</b>
            <span>Completed</span>
          </div>
        </div>

        <button
          className="logout"
          onClick={() => {
            sessionStorage.removeItem("doctorSession");
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
