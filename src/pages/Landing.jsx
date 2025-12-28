import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* DARK OVERLAY */}
      <div className="landing-overlay"></div>

      {/* MAIN CONTENT */}
      <div className="content">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Smart Queue <span>+</span>
          <br />
          Appointment
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Skip long hospital queues.  
          Book the right doctor in minutes with smart scheduling.
        </motion.p>

        <motion.button
          className="get-started"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => navigate("/login")}
        >
          Book Appointment Now
        </motion.button>

        {/* TRUST LINE */}
        <motion.div
          className="trust-line"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          ✔ Faster Appointments &nbsp; • &nbsp; ✔ Smart Queue System &nbsp; • &nbsp; ✔ Trusted Doctors
        </motion.div>
      </div>

      {/* SPECIALTIES */}
      <motion.div
        className="services"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <span>🩺 General</span>
        <span>❤️ Cardiology</span>
        <span>🧠 Neurology</span>
        <span>👶 Pediatrics</span>
        <span>🦴 Ortho</span>
      </motion.div>
    </div>
  );
}
