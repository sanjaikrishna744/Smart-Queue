import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { doctors } from "../data/doctors";
import "./ProfileAuth.css";

export default function ProfileAuth() {
  const [role, setRole] = useState(""); // patient | doctor
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [doctorName, setDoctorName] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      /* ================= PATIENT LOGIN ================= */
      if (role === "patient") {
        const res = await signInWithEmailAndPassword(auth, email, password);

        // 🔥 SAVE PATIENT PROFILE (IMPORTANT)
        localStorage.setItem(
          "patientProfile",
          JSON.stringify({
            uid: res.user.uid,
            email: res.user.email,
            name: res.user.email.split("@")[0], // default name
            age: "-",
            gender: "-",
            phone: "-",
          })
        );

        navigate("/patient-profile");
        return;
      }

      /* ================= DOCTOR LOGIN ================= */
      if (role === "doctor") {
        if (password !== "doctor123") {
          alert("Wrong doctor password");
          return;
        }

        const doctor = doctors.find(d => d.name === doctorName);
        if (!doctor) {
          alert("Doctor not found");
          return;
        }

        sessionStorage.setItem(
          "doctorSession",
          JSON.stringify({
            doctorName: doctor.name,
            speciality: doctor.speciality,
          })
        );

        navigate("/doctor-profile");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="profile-auth">
      <div className="auth-card">
        <h2>Profile Login</h2>

        {/* ROLE SELECT */}
        <div className="role-select">
          <button
            className={role === "patient" ? "active" : ""}
            onClick={() => setRole("patient")}
          >
            👤 Patient
          </button>

          <button
            className={role === "doctor" ? "active" : ""}
            onClick={() => setRole("doctor")}
          >
            🩺 Doctor
          </button>
        </div>

        {/* PATIENT FORM */}
        {role === "patient" && (
          <>
            <input
              placeholder="Patient Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </>
        )}

        {/* DOCTOR FORM */}
        {role === "doctor" && (
          <>
            <select
              value={doctorName}
              onChange={e => setDoctorName(e.target.value)}
            >
              <option value="">Select Doctor</option>
              {doctors.map(d => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            <input
              type="password"
              placeholder="Doctor Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </>
        )}

        <button
          className="login-btn"
          disabled={!role}
          onClick={handleLogin}
        >
          Login →
        </button>
      </div>
    </div>
  );
}
