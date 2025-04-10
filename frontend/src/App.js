import React,{useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "@fortawesome/fontawesome-free/css/all.min.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import './App.css';
import Homepage from './components/Homepage/Homepage';
import ContactUs from './components/Homepage/ContactUs';
import PrivacyPolicy from './components/Homepage/PrivacyPolicy';
import TermsConditions from './components/Homepage/TermsConditions';
import LogSign from './components/LogSign/LogSign';
import ViewProfile from './components/Dashboard/ViewProfile.jsx';

import Dashboard from './components/Dashboard/Dashboard';
import NurseDashboard from './components/Dashboard/NurseDashboard.jsx';
import Inventory from './components/Dashboard/Inventory.jsx';
import ScanQRCodePage from './components/Dashboard/ScanQRCodePage';
import ScanUnitMedicine from './pages/scanUnitMedicine';
import ExpiredMedicines from './components/Dashboard/ExpiredMedicines';
import StockMedicines from './components/Dashboard/StockMedicines';
import NotificationPage from './components/Dashboard/NotificationPage';
import DispensedHistory from './components/MedicineDispense/DispensedHistory'
import Calendar from './components/Dashboard/Calendar';

import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import AdInventory from './components/AdminDashboard/AdInventory';
import Details from './components/AdminDashboard/Details.jsx';

import PharmacistDashboard from './components/PharmacistDashboard/PharmacistDashboard';
import DeptDashboard from './components/PharmacistDashboard/DeptDashoard';
import DeptDetails from './components/PharmacistDashboard/DeptDetails.jsx';
import PharmacistQrPage from './components/PharmacistDashboard/PharmacistQrPage';
import PharmacistScanner from './components/PharmacistScanner/PharmacistScanner';
import BatchInventory from './components/PharmacistDashboard/BatchInventory';

import { DispenseProvider } from "./components/MedicineDispense/MedicineDispense";
import {QRCodePage, ScanMedicinePage,NurseVerificationPage,PatientVerificationPage,BillingPage,DispenseContext} 
from './components/MedicineDispense/MedicineDispense';

import MobileScanPage from './components/MedicineDispense/MobileScanPage';

import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Unauthorized from './pages/unauthorized';


function App() {
  useEffect(() => {
    document.title = "MedCart";
  }, []);
  useEffect(() => {
    const handleBackNavigation = (event) => {
      if (window.location.pathname === "/login") {
        event.preventDefault();
        window.history.pushState(null, "", window.location.href); // Keep user on login
      }
    };
  
    window.addEventListener("popstate", handleBackNavigation);
  
    return () => {
      window.removeEventListener("popstate", handleBackNavigation);
    };
  }, []);
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path='/login' element={<LogSign />} /> {/* Ensure this route is correct */}

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRoles={["nurse"]} />} />
        <Route path="/nursedashboard" element={<ProtectedRoute element={<NurseDashboard />} allowedRoles={["nurse"]} />} />
        <Route path="/profile" element={<ProtectedRoute element={<ViewProfile />} allowedRoles={["nurse"]} />} />
        <Route path="/inventory" element={<ProtectedRoute element={<Inventory/>} allowedRoles={["nurse"]} />} />
        <Route path="/history" element={<ProtectedRoute element={<DispensedHistory />} allowedRoles={["nurse"]} />} />
        <Route path="/notifications" element={<ProtectedRoute element={<NotificationPage />} allowedRoles={["nurse","pharmacist"]} />} />
        <Route path="/scan-qrcode" element={<ScanQRCodePage />} /> 
        <Route path="/scan-unit-medicine" element={<ScanUnitMedicine />} />
        <Route path="/expired-medicines" element={<ExpiredMedicines />} />
        <Route path="/stock-medicines" element={<StockMedicines />} />
        <Route path="/calendar" element={<Calendar />} />

        <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={["admin"]} />} />
        <Route path="/ad-inventory" element={<ProtectedRoute element={<AdInventory/>} allowedRoles={["admin"]} />}/>
        <Route path="/dept-detail/:deptId" element={<ProtectedRoute element={<Details />} allowedRoles={["admin"]} />} />

        <Route path="/pharmacist" element={<ProtectedRoute element={<PharmacistDashboard />} allowedRoles={["pharmacist"]} />}/>
        <Route path="/dept-dashboard" element={<ProtectedRoute element={<DeptDashboard />} allowedRoles={["pharmacist"]} />} />
        <Route path="/dept-detail" element={<DeptDetails/>}/>
        <Route path="/pharmacist-qr-page" element={<PharmacistQrPage />} />
        <Route path="/pharmacist/scanner" element={<PharmacistScanner />} />
        <Route path="/batch-inventory" element={<BatchInventory/>}/>

        {/* Dispensing Routes inside DispenseProvider */}
        <Route path="/*" element={
          <DispenseProvider>
            <Routes>
              <Route path="/qrcode" element={<QRCodePage />} />
              <Route path="/mobile-scan" element={<MobileScanPage />} />
              <Route path="/scan-medicine" element={<ScanMedicinePage />} />
              <Route path="/verify-nurse" element={<NurseVerificationPage />} />
              <Route path="/verify-patient" element={<PatientVerificationPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="*" element={<Navigate to="/login" />} /> {/* Fallback inside DispenseProvider */}
            </Routes>
          </DispenseProvider>
        } />

        {/* Unauthorized & Final Fallback */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  );
}

export default App;

