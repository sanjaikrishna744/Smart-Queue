import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import "./BookAppointment.css";

export default function BookAppointment() {
  const navigate = useNavigate();
  const [slot, setSlot] = useState("");

  const doctor = JSON.parse(localStorage.getItem("selectedDoctor"));
  const patient = JSON.parse(localStorage.getItem("patientProfile"));

  if (!doctor || !patient) {
    navigate("/");
    return null;
  }

  const appointmentDate = patient.date;
  const today = new Date().toISOString().split("T")[0];
  const isToday = appointmentDate === today;

  const slots = [
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
  ];

  const confirmBooking = async () => {
    if (!slot) {
      alert("Please select a time slot");
      return;
    }

    try {
      await addDoc(collection(db, "appointments"), {
        patientId: auth.currentUser.uid,
        patientName: patient.name,
        patientAge: patient.age,
        patientGender: patient.gender,
        patientPhone: patient.phone,
        patientAddress: patient.address,
        patientEmail: auth.currentUser.email,

        doctorId: doctor.id,
        doctorName: doctor.name,
        speciality: doctor.speciality,

        problem: doctor.problem,
        appointmentDate,
        appointmentTime: slot,

        status: isToday ? "BOOKED" : "SCHEDULED",
        isActive: isToday, // 🔥 only today active
        createdAt: serverTimestamp(),
      });

      // ✅ DATE BASED REDIRECT
      if (isToday) {
        navigate("/queue");
      } else {
        navigate("/booking-success");
      }
    } catch (err) {
      console.error(err);
      alert("Booking failed. Please try again.");
    }
  };

  return (
    <div className="book-page">
      <h1>Confirm Appointment</h1>

      <p><b>Doctor:</b> {doctor.name}</p>
      <p><b>Problem:</b> {doctor.problem}</p>
      <p><b>Date:</b> {appointmentDate}</p>

      <h3>Select Time Slot</h3>

      <div className="slot-grid">
        {slots.map((s) => (
          <button
            key={s}
            className={slot === s ? "slot active" : "slot"}
            onClick={() => setSlot(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <button className="confirm-btn" onClick={confirmBooking}>
        Book Appointment →
      </button>
    </div>
  );
}
