import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";
import "./DoctorPanel.css";

export default function DoctorPanel() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "appointments"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arrived = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((a) => a.status === "ARRIVED");

      setQueue(arrived);
    });

    return () => unsub();
  }, []);

  const completeVisit = async (id) => {
    await updateDoc(doc(db, "appointments", id), {
      status: "COMPLETED",
    });
  };

  return (
    <div className="doctor-panel-page">
      <h1>Doctor Queue Panel</h1>

      {queue.length === 0 && <p>No patients waiting</p>}

      {queue.map((p, index) => (
        <motion.div
          key={p.id}
          className="doctor-queue-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Q-{index + 1}</h3>
          <p><b>Problem:</b> {p.problem}</p>
          <p><b>Patient:</b> {p.patientEmail}</p>

          <button onClick={() => completeVisit(p.id)}>
            ✔ Complete Visit
          </button>
        </motion.div>
      ))}
    </div>
  );
}
