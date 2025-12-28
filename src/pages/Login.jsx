import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <motion.div
        className="login-card"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <h2>Welcome 👋</h2>

        <p className="subtitle">
          Choose how you want to continue
        </p>

        <button
          className="patient"
          onClick={() => navigate("/patient-auth")}
        >
          Continue as Patient
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        {/* 🔥 ONLY FIX IS HERE */}
       <button
  className="doctor"
  onClick={() => navigate("/doctor-auth")}
>
  Continue as Doctor
</button>


        <p className="note">
          Secure • Fast • Trusted platform
        </p>
      </motion.div>
    </div>
  );
}
