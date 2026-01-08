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
  const [loading, setLoading] = useState(false);

  /* 🔥 AUTO DOCTOR MATCH (UNCHANGED LOGIC) */
  useEffect(() => {
    if (!triage?.selectedSymptoms) return;

    const matched = doctors.filter((d) =>
      d.problems.some((p) =>
        triage.selectedSymptoms.some(
          (s) => s.toLowerCase() === p.toLowerCase()
        )
      )
    );

    setDoctor(matched.length > 0 ? matched[0] : doctors[0]);
  }, [triage]);

  /* DATE LIMIT */
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 7);
  const fmt = (d) => d.toISOString().split("T")[0];

  /* 🔥 BOOK APPOINTMENT (BACKEND ONLY) */
  const book = async () => {
    if (!doctor || !session || !date) {
      alert("Select date & session");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Login expired");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/queue/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: user.uid, // 🔥 Firebase UID
          patientName: patient?.name || "",
          patientAge: Number(patient?.age || 0),
          patientProblem:
            patient?.problem ||
            triage?.selectedSymptoms?.join(", ") ||
            "",

          doctorId: String(doctor.id),
          doctorName: doctor.name,

          session,
          appointmentDate: date,
          priorityType: triage?.priorityType || "OPD",
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Booking failed");
        setLoading(false);
        return;
      }

      // 🔥 TODAY → QUEUE PAGE
      if (date === fmt(today)) {
        navigate("/queue");
      } else {
        navigate("/booking-success");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return <p>Loading…</p>;

  return (
    <div className="book-wrapper">
      <div className="book-card">
        <h2>{doctor.name}</h2>

        <div className="session-grid">
          {[
            { label: "Morning", value: "morning" },
            { label: "Afternoon", value: "afternoon" },
            { label: "Evening", value: "evening" },
          ].map((s) => (
            <button
              key={s.value}
              className={session === s.value ? "active" : ""}
              onClick={() => setSession(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <input
          type="date"
          min={fmt(today)}
          max={fmt(maxDate)}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button onClick={book} disabled={loading}>
          {loading ? "Booking…" : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}