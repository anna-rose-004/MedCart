import React from "react";
import { useState, useEffect } from "react";
import "./StockMedicines.css";
import { FaExclamationTriangle } from "react-icons/fa";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL_LOCAL; // Fallback to local URL if not set

const StockMedicines = () => {
  const [stockMedicines, setStockMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const getCrashcartId = () => {
    let crashcartId = localStorage.getItem("crashcart_id");
    return crashcartId && crashcartId !== "undefined" ? Number(crashcartId) : 1;
  };

  // Fetch expiring medicines
  const fetchStockMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const crashcartId = getCrashcartId();
      console.log("Fetching stock medicines for crashcart_id:", crashcartId);
      const response = await fetch(`${BACKEND_URL}/api/unit-medicine/stock-medicines?crashcart_id=${crashcartId}`);
      const data = await response.json();
      console.log("API Response:", data);
      setStockMedicines(data.length > 0 ? data : []);
    } catch (error) {
      console.error(" Error fetching stock medicines:", error);
    }
  };

  useEffect(() => {
    fetchStockMedicines();
    const interval = setInterval(fetchStockMedicines, 30000);
    return () => clearInterval(interval);
  }, []);

const getRowClass = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { className: "expiry-red", icon: <FaExclamationTriangle className="expired-icon" /> };
  } else if (diffDays > 0 && diffDays <= 4) {
    return { className: "expiry-orange", icon: null };
  } else if (diffDays > 4 && diffDays <= 30) {
    return { className: "expiry-yellow", icon: null };
  } else {
    return { className: "expiry-normal", icon: null }; // Safe medicines
  }                    
};


const formatDate = (dateString) => {
  return new Intl.DateTimeFormat("en-GB").format(new Date(dateString)); // DD/MM/YYYY format
};
return (
    <div className="expiring-medicines-container">
        <h2>Medicines Available</h2>
        <table className="expiring-table">
            <thead>
                <tr>
                    <th>Medicine Name</th>
                    <th>Unit ID</th>
                    <th>Batch ID</th>
                    <th>Expiry Date</th>
                </tr>
            </thead>
            <tbody>
            {stockMedicines.length > 0 ? (
                stockMedicines.map((med, index, arr) => (
                    <tr key={index}>
                        <td>{index === 0 || med.medicine_name !== arr[index - 1].medicine_name ? <b>{med.medicine_name}</b> : ""}</td>
                        <td>{med.unit_id}</td>
                        <td>{med.batch_id}</td>
                        
                        <td className={`expiry ${getRowClass(med.expiry_date).className}`}>
                          {formatDate(med.expiry_date)} {getRowClass(med.expiry_date).icon}
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="4">No expiring medicines found</td>
                </tr>
            )}
            </tbody>
        </table>
    </div>
);
};

export default StockMedicines;
