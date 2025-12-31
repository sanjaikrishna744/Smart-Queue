import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./QueuePage.css";

/* 🏥 SALEM WEST */
const HOSPITAL = {
  city: "Salem West",
  lat: 11.6643,
  lng: 78.1460,
  radiusKm: 5,
};

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function QueuePage() {
  const [appointment, setAppointment] = useState(null);
  const [queue, setQueue] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");
  const navigate = useNavigate();

  /* ACTIVE APPOINTMENT */
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", auth.currentUser.uid),
      where("isActive", "==", true)
    );

    return onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setAppointment({
          id: snap.docs[0].id,
          ...snap.docs[0].data(),
        });
      }
    });
  }, []);

  /* QUEUE */
  useEffect(() => {
    if (!appointment || appointment.status !== "ARRIVED") {
      setQueue([]);
      return;
    }

    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", appointment.doctorId),
      where("status", "==", "ARRIVED"),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snap) => {
      setQueue(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [appointment]);

  /* REDIRECT */
  useEffect(() => {
    if (appointment?.status === "COMPLETED") {
      setTimeout(() => navigate("/"), 3000);
    }
  }, [appointment, navigate]);

  if (!appointment) {
    return (
      <div className="queue-page center">
        <p>Loading appointment…</p>
      </div>
    );
  }

  const markArrived = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const d = getDistanceKm(
          pos.coords.latitude,
          pos.coords.longitude,
          HOSPITAL.lat,
          HOSPITAL.lng
        );

        if (d > HOSPITAL.radiusKm) {
          setStatusMsg(
            `📍 ${d.toFixed(1)} km away. Reach ${HOSPITAL.city} hospital`
          );
          return;
        }

        await updateDoc(doc(db, "appointments", appointment.id), {
          status: "ARRIVED",
        });

        setStatusMsg("🟢 Location verified. Added to queue");
      },
      () => setStatusMsg("📍 Enable location to confirm arrival")
    );
  };

  const myIndex = queue.findIndex((q) => q.id === appointment.id);
  const myToken = myIndex + 1;
  const aiWait = myIndex >= 0 ? myIndex * 10 : "--";

  /* COMPLETED */
  if (appointment.status === "COMPLETED") {
    return (
      <div className="queue-page center">
        <motion.div
          className="completed-card"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <h2>✅ Consultation Over</h2>
          <p>Thank you for visiting</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="queue-page">
      {/* LEFT */}
      <div className="summary-card">
        <h2>Appointment</h2>

        <p><b>Name:</b> {appointment.patientName}</p>
        <p><b>Doctor:</b> {appointment.doctorName}</p>
        <p><b>Hospital:</b> {HOSPITAL.city}</p>

        {appointment.status === "BOOKED" && (
          <button className="arrive-btn" onClick={markArrived}>
            📍 I have arrived
          </button>
        )}

        {appointment.status === "ARRIVED" && (
          <>
            <p className="status arrived">🟢 In Queue</p>
            <p className="ai-time">⏳ Est. Wait: {aiWait} mins</p>
          </>
        )}

        {appointment.status === "APPROVED" && (
          <p className="status approved">🩺 Consultation ongoing</p>
        )}

        {statusMsg && <p className="info">{statusMsg}</p>}
      </div>

      {/* RIGHT */}
      <AnimatePresence>
        {appointment.status === "ARRIVED" && (
          <motion.div
            className="queue-card"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <h2>Your Token</h2>
            <div className="token">Q-{myToken}</div>

            <div className="queue-3d">
              {queue.map((p, i) => (
                <motion.div
                  key={p.id}
                  className={`queue-item ${
                    p.id === appointment.id ? "me" : ""
                  }`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ transform: `translateZ(${30 - i * 6}px)` }}
                >
                  {p.id === appointment.id ? "YOU" : "Patient"} – Q{i + 1}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}