import React, { createContext, useState, useContext, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./MedicineDispense.module.css";
import io from "socket.io-client";

const socket = io(`${process.env.REACT_APP_BACKEND_URL}`, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});


// Create a context to share dispensing state across pages
const DispenseContext = createContext();

export const DispenseProvider = ({ children }) => {
  const [scannedMedicines, setScannedMedicines] = useState(() => {
    try {
      const storedMedicines = localStorage.getItem("scannedMedicines");
      return storedMedicines ? JSON.parse(storedMedicines) : [];
    } catch (error) {
      console.error("❌ Error reading scanned medicines from localStorage:", error);
      return [];
    }
  });

  // Ensure `nurseId` and `patientId` persist even after page reload
  const [nurseId, setNurseId] = useState(() => localStorage.getItem("nurse_id") || "");
  const [patientId, setPatientId] = useState(() => localStorage.getItem("patient_id") || "");
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    if (nurseId) localStorage.setItem("nurse_id", nurseId);
    if (patientId) localStorage.setItem("patient_id", patientId);
  }, [nurseId, patientId]);

  

  return (
    <DispenseContext.Provider value={{ 
      scannedMedicines, setScannedMedicines, 
      nurseId, setNurseId, 
      patient, setPatient, 
      patientId, setPatientId 
    }}>
      {children}
    </DispenseContext.Provider>
  );
};

// QR Code Page
const QRCodePage = () => {
  const navigate = useNavigate();
  const [qrValue, setQrValue] = useState(process.env.REACT_APP_QR_SCAN_URL);

  return (
    <div className="container">
      <h2>Scan QR Code to Start Dispensing</h2>
      <QRCodeSVG value={qrValue} size={200} />

      {/*  Go Back follows natural navigation order */}
      <button onClick={() => navigate(-1)} style={{ marginRight: "10px" }}>Go Back</button>

      <button onClick={() => navigate("/scan-medicine")}>Proceed to Scanning</button>
    </div>
  );
};


const ScanMedicinePage = () => {
  const { scannedMedicines, setScannedMedicines } = useContext(DispenseContext);
  const [duplicateAlertShown, setDuplicateAlertShown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("📡 Listening for scanned medicines...");
  
    socket.on("connect", () => console.log("✅ Connected to WebSocket Server:", socket.id));
  
    socket.on("medicine-scanned", (medicineData) => {
      console.log("📩 Received Medicine Data:", medicineData);
  
      setScannedMedicines((prev) => {
        if (!Array.isArray(prev)) return [medicineData];
  
        const isDuplicate = prev.some(
          (m) =>
            m.unit_id === medicineData.unit_id &&
            m.batch_id === medicineData.batch_id &&
            m.name === medicineData.name
        );
  
        if (isDuplicate) {
          console.log("⚠️ Duplicate scan detected, ignoring:", medicineData);
          if (!duplicateAlertShown) {
            alert(
              `⚠️ Medicine ${medicineData.name} (Batch: ${medicineData.batch_id}, Unit ID: ${medicineData.unit_id}) has already been scanned!`
            );
            setDuplicateAlertShown(true);
          }
          return prev;
        }
  
        console.log("✅ Adding new medicine to the list:", medicineData);
        return [...prev, medicineData];
      });
    });
  
    // 👇 Remove only the listener, not the socket itself
    return () => {
      socket.off("medicine-scanned");
    };
  }, [setScannedMedicines]);
  

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Live Scanned Medicines</h2>

      {scannedMedicines.length === 0 ? (
        <p className={styles.noMedicine}>🔍 No medicines scanned yet.</p>
      ) : (
        <ul className={styles.medicineList}>
          {scannedMedicines.map((medicine, index) => (
            <li key={index} className={styles.medicineItem}>
              <strong>{medicine.name}</strong>
              <p>Batch: {medicine.batch_id}</p>
              <p>Price: {medicine.price}</p>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={() => navigate(-1)}>⬅ Go Back</button>
        <button className={styles.primaryButton} onClick={() => navigate("/verify-nurse")}>✅ Verify & Proceed</button>
      </div>
    </div>
  );
};

//  Nurse Verification Page
const NurseVerificationPage = () => {
  const { nurseId, setNurseId } = useContext(DispenseContext);
  const navigate = useNavigate();

  const handleProceed = () => {
    if (!nurseId.trim()) {
      alert("❌ Please enter your Nurse ID.");
      return;
    }
    localStorage.setItem("nurse_id", nurseId);
    setNurseId(nurseId);
    navigate("/verify-patient");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}> {/* ✅ Gradient Background Box */}
        <h2 className={styles.title}>Nurse Verification</h2>
        
        <input
          type="text"
          className={styles.input}
          value={nurseId}
          onChange={(e) => setNurseId(e.target.value)}
          placeholder="🔍 Enter Nurse ID"
        />
        
        <div className={styles.buttonGroup}>
          <button className={styles.secondaryButton} onClick={() => navigate(-1)}>
            ⬅ Go Back
          </button>
          <button className={styles.primaryButton} onClick={handleProceed}>
            ✅ Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

// Patient Verification Page
const PatientVerificationPage = () => {
  const { patient, setPatient, patientId, setPatientId } = useContext(DispenseContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fetchPatient = async () => {
    if (!patientId.trim()) {
      alert("❌ Patient ID is empty. Please enter a valid ID.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/unit-medicine/patient/${patientId}`);
      setPatient(response.data);
      localStorage.setItem("patient_id", patientId);
      setPatientId(patientId);
    } catch (error) {
      alert(error.response?.data?.error || "❌ Patient not found");
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToBilling = () => {
    if (!patient) {
      alert("❌ Please fetch patient details first.");
      return;
    }
    navigate("/billing");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}> {/* ✅ Gradient Background Box */}
        <h2 className={styles.title}>Patient Verification</h2>
        
        <input
          type="text"
          className={styles.input}
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="🔍 Enter Patient ID"
        />

        <button
          className={styles.fetchButton}
          onClick={fetchPatient}
          disabled={loading}
        >
          {loading ? "⏳ Fetching..." : "🔍 Fetch Patient"}
        </button>

        {/* ✅ Display Patient Details in a Styled Box */}
        {patient && (
          <div className={styles.patientDetails}>
            <h3>👤 Patient Details</h3>
            <p><strong>Name:</strong> {patient.name}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Admission Date:</strong> {patient.admission_date}</p>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button className={styles.secondaryButton} onClick={() => navigate(-1)}>
            ⬅ Go Back
          </button>
          <button
            className={styles.primaryButton}
            onClick={handleProceedToBilling}
            disabled={!patient}
          >
            ✅ Proceed to Billing
          </button>
        </div>
      </div>
    </div>
  );
};
const BillingPage = () => {
  const { scannedMedicines, setScannedMedicines, nurseId, patient } = useContext(DispenseContext);
  const navigate = useNavigate();

  const totalPrice = scannedMedicines.reduce((acc, med) => acc + (parseFloat(med.price) || 0), 0);

  const confirmDispensing = async () => {
    if (!nurseId || !patient) {
      alert("❌ Missing Nurse or Patient information.");
      return;
    }
  
    try {
      console.log("🟢 Sending Dispensing Request to Backend...");
      
      for (const med of scannedMedicines) {
        console.log("📩 Sending:", med);
  
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/unit-medicine/dispense`, {
          unit_id: med.unit_id,
          batch_id: med.batch_id,
          name: med.name,  
          patient_id: patient.patient_id,
          nurse_id: nurseId,
          price: med.price || 0,
        });
  
        console.log("✅ Response from backend:", response.data);
      }
  
      alert("✅ Medicines dispensed successfully!");
      setScannedMedicines([]);
      localStorage.removeItem("scannedMedicines");
      navigate("/dashboard");
  
    } catch (error) {
      console.error("❌ Dispensing failed:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Dispensing failed.");
    }
  };
  return (
    <div className={styles.bcontainer}>
      <div className={styles.bcard}> 
        <h2 className={styles.btitle}>💊 Billing Confirmation</h2>
        <div className={styles.infoSection}>
          <p><strong>👤 Patient:</strong> {patient?.name} (ID: {patient?.patient_id})</p>
          <p><strong>🩺 Nurse ID:</strong> {nurseId}</p>
        </div>

        {/* ✅ Medicine List Table */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Batch ID</th>
              <th>Unit ID</th>
              <th>Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            {scannedMedicines.length > 0 ? (
              scannedMedicines.map((med, index) => (
                <tr key={index}>
                  <td>{med.name}</td>
                  <td>{med.batch_id}</td>
                  <td>{med.unit_id}</td>
                  <td>₹{parseFloat(med.price).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.noMedicines}>⚠️ No medicines scanned.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ Total Price */}
        <h3 className={styles.totalPrice}>Total: ₹{totalPrice.toFixed(2)}</h3>

        {/* ✅ Buttons */}
        <div className={styles.buttonGroup}>
          <button className={styles.secondaryButton} onClick={() => navigate(-1)}>⬅ Go Back</button>
          <button className={styles.primaryButton} onClick={confirmDispensing}>✅ Confirm & Dispense</button>
        </div>
      </div>
    </div>
  );
};

export {
  QRCodePage,
  ScanMedicinePage,
  NurseVerificationPage,
  PatientVerificationPage,
  BillingPage,
  DispenseContext
};
