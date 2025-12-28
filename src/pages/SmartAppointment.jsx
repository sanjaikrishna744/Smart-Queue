import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doctors } from "../data/doctors";
import { motion } from "framer-motion";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import "./SmartAppointment.css";

export default function SmartAppointment() {
  const [problem, setProblem] = useState("");
  const navigate = useNavigate();

  const problems = [
    "Chest Pain",
    "Heart Checkup",
    "High BP",
    "Diabetes",
    "Headache",
    "Migraine",
    "Back Pain",
    "Joint Pain",
  ];

  const filteredDoctors = problem
    ? doctors.filter((d) => d.problems.includes(problem))
    : [];

  const bookDoctor = async (doc) => {
    const patient = JSON.parse(localStorage.getItem("patientDetails"));

    if (!patient) {
      alert("Patient details missing");
      return;
    }

    await addDoc(collection(db, "appointments"), {
      patientId: auth.currentUser.uid,
      patientName: patient.name,
      patientAge: patient.age,
      patientPhone: patient.phone,

      patientEmail: auth.currentUser.email,
      problem: problem,

      doctorId: doc.uid,          // 🔥 KEY FIX
      doctorName: doc.name,

      status: "BOOKED",
      isActive: true,

      createdAt: serverTimestamp(),
    });

    navigate("/queue");
  };

  return (
    <motion.div className="smart-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Select Problem</h1>

      <div className="problem-select">
        {problems.map((p) => (
          <button
            key={p}
            className={problem === p ? "problem active" : "problem"}
            onClick={() => setProblem(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {problem && (
        <div className="doctor-list">
          {filteredDoctors.map((doc) => (
            <div className="doctor-card split" key={doc.id}>
              <div>
                <h3>{doc.name}</h3>
                <p>{doc.speciality}</p>
                <p>{doc.experience}</p>

                <button onClick={() => bookDoctor(doc)}>
                  Book with this Doctor
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
