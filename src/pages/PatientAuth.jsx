import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import "./PatientAuth.css";

export default function PatientAuth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      // 🔥 IMPORTANT CHANGE
      navigate("/patient-details");

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-page">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          className="auth-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>{mode === "login" ? "Patient Login" : "Create Account"}</h2>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleSubmit}>
            {mode === "login" ? "Login" : "Signup"}
          </button>

          <p className="switch-text">
            {mode === "login" ? (
              <span onClick={() => setMode("signup")}>Create account</span>
            ) : (
              <span onClick={() => setMode("login")}>Login</span>
            )}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
