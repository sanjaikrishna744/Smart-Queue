import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import "./DoctorAuth.css";

export default function DoctorAuth() {
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
      navigate("/doctor-dashboard");
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <h2>
            {mode === "login" ? "Doctor Login" : "Doctor Signup"}
          </h2>

          <input
            placeholder="Doctor Email"
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
            {mode === "login" ? "Login" : "Create Account"}
          </button>

          <p className="switch-text">
            {mode === "login" ? (
              <>
                New doctor?{" "}
                <span onClick={() => setMode("signup")}>
                  Create account
                </span>
              </>
            ) : (
              <>
                Already registered?{" "}
                <span onClick={() => setMode("login")}>
                  Login
                </span>
              </>
            )}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
