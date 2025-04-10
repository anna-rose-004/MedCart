import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StockMedicines.css";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL_LOCAL;

const ExpiredMedicines = () => {
  const [expiredMedicines, setExpiredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCrashcartId = () => {
    let crashcartId = localStorage.getItem("crashcart_id");
    return crashcartId && crashcartId !== "undefined" ? Number(crashcartId) : 1;
  };

  const fetchExpiredMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const crashcartId = getCrashcartId();
      console.log("Fetching expired medicines for crashcart_id:", crashcartId);
      const response = await fetch(
        `${BACKEND_URL}/api/unit-medicine/expired-medicines?crashcart_id=${crashcartId}`
      );
      const data = await response.json();
      console.log("API Response:", data);
      setExpiredMedicines(data.length > 0 ? data : []);
    } catch (error) {
      console.error("Error fetching expired medicines:", error);
      setError("Failed to fetch expired medicines");
    } finally {
      setLoading(false);
    }
  };

  const removeExpiredMedicine = async (unit_id, batch_id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;

    const removedBy = localStorage.getItem("role") || "Unknown User";
    try {
      const response = await axios.delete(
        `${BACKEND_URL}/api/unit-medicine/remove-expired/${unit_id}/${batch_id}/${encodeURIComponent(name)}`,
        { headers: { "removed-by": removedBy } } // ✅ Send the remover's name
      );

      alert(response.data.message);
      fetchExpiredMedicines(); // Refresh list
    } catch (error) {
      console.error("Error removing expired medicine:", error);
      alert("❌ Failed to remove expired medicine.");
    }
  };

  useEffect(() => {
    fetchExpiredMedicines();
    const interval = setInterval(fetchExpiredMedicines, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-GB").format(new Date(dateString)); // DD/MM/YYYY format
  };

  return (
    <div className="expiring-medicines-container">
      <h2>Expired Medicines</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : expiredMedicines.length > 0 ? (
        <table className="expiring-table">
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Unit ID</th>
              <th>Batch ID</th>
              <th>Expiry Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expiredMedicines.map((med, index) => (
              <tr key={index}>
                <td>{med.medicine_name}</td>
                <td>{med.unit_id}</td>
                <td>{med.batch_id}</td>
                <td>{formatDate(med.expiry_date)}</td>
                <td>
                  <button
                    className="remove-btn"
                    onClick={() => removeExpiredMedicine(med.unit_id, med.batch_id, med.medicine_name)}
                  >
                    ❌ Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No expired medicines found</p>
      )}
    </div>
  );
};

export default ExpiredMedicines;
