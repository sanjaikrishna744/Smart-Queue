import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import PatientAuth from "./pages/PatientAuth";
import PatientDetails from "./pages/PatientDetails";
import SmartAppointment from "./pages/SmartAppointment";
import QueuePage from "./pages/QueuePage";
import DoctorAuth from "./pages/DoctorAuth";
import DoctorDashboard from "./pages/DoctorDashboard";

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/patient-auth" element={<PageWrapper><PatientAuth /></PageWrapper>} />
        <Route path="/patient-details" element={<PageWrapper><PatientDetails /></PageWrapper>} />
        <Route path="/smart-appointment" element={<PageWrapper><SmartAppointment /></PageWrapper>} />
        <Route path="/queue" element={<PageWrapper><QueuePage /></PageWrapper>} />
        <Route path="/doctor-auth" element={<PageWrapper><DoctorAuth /></PageWrapper>} />
        <Route path="/doctor-dashboard" element={<PageWrapper><DoctorDashboard /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ minHeight: "100vh" }}
    >
      {children}
    </motion.div>
  );
}
