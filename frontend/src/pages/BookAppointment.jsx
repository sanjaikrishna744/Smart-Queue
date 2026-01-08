import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { doctors } from "../data/doctors";
import "./BookAppointment.css";

const API = "http://localhost:5000";

export default function BookAppointment() {
  const navigate = useNavigate();

  const triage = JSON.parse(sessionStorage.getItem("triage"));
  const patient = JSON.parse(localStorage.getItem("patientProfile"));

  const [doctor, setDoctor] = useState(null);
  const [session, setSession] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (!triage?.selectedSymptoms) {
      setDoctor(doctors[0]);
      return;
    }

    const matched = doctors.filter((d) =>
      d.problems.some((p) =>
        triage.selectedSymptoms.some(
          (s) => s.toLowerCase() === p.toLowerCase()
        )
      )
    );

    setDoctor(matched[0] || doctors[0]);
  }, [triage]);

  const today = new Date().toISOString().split("T")[0];

  const book = async () => {
    if (!doctor || !session || !date) {
      alert("Select date & session");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Login required");
      return;
    }

    try {
      const res = await fetch(`${API}/queue/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: user.uid,
          patientName: patient?.name || "Patient",
          patientAge: Number(patient?.age ?? 1),
          patientProblem:
            patient?.problem ||
            triage?.selectedSymptoms?.join(", ") ||
            "General",

          doctorId: doctor.id,
          doctorName: doctor.name,
          session,
          priorityType: triage?.priorityType || "OPD",
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert("Booking failed");
        return;
      }

      navigate("/queue");
    } catch (err) {
      console.error(err);
      alert("Booking error");
    }
  };

  if (!doctor) return <p>Loading…</p>;

  return (
    <div className="book-wrapper">
      <div className="book-card">
        <h2>{doctor.name}</h2>

        {/* DATE FIRST */}
        <div className="date-box">
          <label>Select Date</label>
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* SESSION NEXT */}
        <p className="session-title">Select Session</p>
        <div className="session-grid">
          {["morning", "afternoon", "evening"].map((s) => (
            <button
              key={s}
              className={`session-btn ${session === s ? "active" : ""}`}
              onClick={() => setSession(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* CONFIRM LAST */}
        <button className="confirm-btn" onClick={book}>
          Confirm Booking
        </button>
      </div>
    </div>
  );
}