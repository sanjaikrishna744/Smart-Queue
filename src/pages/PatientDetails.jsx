import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./PatientDetails.css";

export default function PatientDetails() {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");

  const navigate = useNavigate();

  const handleContinue = () => {
    if (!name || !age || !gender || !phone || !address || !date) {
      alert("Please fill all details including appointment date");
      return;
    }

    const profile = {
      name,
      age,
      gender,
      phone,
      address,
      date, // 🔥 IMPORTANT
    };

    localStorage.setItem("patientProfile", JSON.stringify(profile));

    navigate("/smart-appointment");
  };

  // date limit: today → next 7 days
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 7);

  const formatDate = (d) => d.toISOString().split("T")[0];

  return (
    <div className="patient-page">
      <div className="hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>
            Smart Appointment <span>Booking</span>
          </h1>
          <p>Skip long hospital queues. Book trusted doctors in minutes.</p>

          <button onClick={() => setOpen(true)}>Start Booking →</button>
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="overlay" onClick={() => setOpen(false)} />

            <motion.div
              className="patient-form"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
            >
              <h2>Patient Details</h2>
              <p className="form-sub">Enter your details to continue</p>

              <input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                placeholder="Age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />

              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>

              <input
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <textarea
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <label className="date-label">
                Appointment Date (Next 7 days)
              </label>
              <input
                type="date"
                min={formatDate(today)}
                max={formatDate(maxDate)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              <button onClick={handleContinue}>
                Continue to Doctor Selection →
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
