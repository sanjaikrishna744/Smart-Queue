import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doctors } from "../data/doctors";
import { useNavigate } from "react-router-dom";
import "./PatientDetails.css";

export default function PatientDetails() {
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");

  const navigate = useNavigate();

  const handleContinue = () => {
    if (!name || !age || !gender || !phone || !date) {
      alert("Fill all details");
      return;
    }

    localStorage.setItem(
      "patientProfile",
      JSON.stringify({
        name,
        age,
        gender,
        phone,
        appointmentDate: date,
      })
    );

    navigate("/smart-appointment");
  };

  return (
    <div className="patient-layout">
      {/* LEFT CARD */}
      <motion.div className="hero-card">
        <div className="hero-text">
          <h1>Book Appointment</h1>
          <h2>With Trusted Doctors</h2>
          <p>Book appointments easily without waiting.</p>

          <button onClick={() => setShowForm(true)}>
            Book Appointment →
          </button>
        </div>

        <div className="hero-image">
          <img src="/doctor.jpg" alt="Doctor" />
        </div>
      </motion.div>

      {/* RIGHT DOCTOR DISPLAY */}
      <div className="doctor-panel">
        <h3>Available Doctors</h3>
        {doctors.map((d) => (
          <div key={d.id} className="doctor-card">
            <h4>{d.name}</h4>
            <span>{d.speciality} • {d.experience}</span>
            <p>{d.description}</p>
          </div>
        ))}
      </div>

      {/* SLIDE FORM */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div className="overlay" onClick={() => setShowForm(false)} />

            <motion.div className="slide-form">
              <h2>Patient Details</h2>

              <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
              <input placeholder="Age" value={age} onChange={e => setAge(e.target.value)} />
              <input placeholder="Gender" value={gender} onChange={e => setGender(e.target.value)} />
              <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />

              <button onClick={handleContinue}>
                Continue →
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
