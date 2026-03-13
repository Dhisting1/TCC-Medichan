import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorNew from "./pages/doctor/DoctorNew";
import DoctorHistory from "./pages/doctor/DoctorHistory";
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/doctor" element={<ProtectedRoute role="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/new" element={<ProtectedRoute role="DOCTOR"><DoctorNew /></ProtectedRoute>} />
        <Route path="/doctor/history" element={<ProtectedRoute role="DOCTOR"><DoctorHistory /></ProtectedRoute>} />

        <Route path="/pharmacy" element={<ProtectedRoute role="PHARMACY"><PharmacyDashboard /></ProtectedRoute>} />
        <Route path="/patient" element={<ProtectedRoute role="PATIENT"><PatientDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
