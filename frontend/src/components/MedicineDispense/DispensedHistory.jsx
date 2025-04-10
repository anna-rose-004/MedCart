import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./MedicineDispense.module.css";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL_LOCAL; // Fallback for local development

const DispensedHistory = () => {
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({ nurse_id: "", patient_id: "", start_date: "", end_date: "" });

  useEffect(() => {
    return () => setHistory([]);
  }, []);

  const fetchHistory = async () => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value.trim() !== "")
      );

      console.log("🔍 Fetching from API with filters:", filteredParams);
      const response = await axios.get(`${BACKEND_URL}/api/unit-medicine/dispensed-history`, {
        params: filteredParams,
      });

      console.log("✅ Dispensed History Data:", response.data);
      setHistory(response.data);
    } catch (error) {
      console.error("❌ Error fetching dispensed history:", error.response?.data || error.message);
    }
  };

  return (
    <div className={styles.dcontainer}>
      <h2 className={styles.dtitle}>📜 Dispensed Medicine History</h2>

      <div className={styles.dfilterContainer}>
        <input
          type="text"
          placeholder="Search Nurse ID"
          value={filters.nurse_id}
          onChange={(e) => setFilters({ ...filters, nurse_id: e.target.value })}
        />
        <input
          type="text"
          placeholder="Search Patient ID"
          value={filters.patient_id}
          onChange={(e) => setFilters({ ...filters, patient_id: e.target.value })}
        />
        <input
          type="date"
          value={filters.start_date}
          onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
        />
        <input
          type="date"
          value={filters.end_date}
          onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
        />
        <button className={styles.dsearchButton} onClick={fetchHistory}>🔍 Search</button>
      </div>

      {history.length > 0 && (
        <table className={styles.dtable}>
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Batch ID</th>
              <th>Unit ID</th>
              <th>Patient</th>
              <th>Nurse</th>
              <th>Dispense Time</th>
              <th>Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record, index) => (
              <tr key={index}>
                <td>{record.name}</td>
                <td>{record.batch_id}</td>
                <td>{record.unit_id}</td>
                <td>{record.patient_name} (ID: {record.patient_id})</td>
                <td>{record.nurse_id}</td>
                <td>{new Date(record.dispense_time).toLocaleString()}</td>
                <td>₹{parseFloat(record.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {history.length === 0 && (
        <p className={styles.dnoData}>⚠️ No Dispensed Records Found</p>
      )}
    </div>
  );
};

export default DispensedHistory;
