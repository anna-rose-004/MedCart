import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL_LOCAL;

const Details = () => {
  const { deptId } = useParams(); // deptId == crashcart_id
  const [medicines, setMedicines] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (deptId) {
      fetchMedicines();
    }
  }, [deptId]);

  const fetchMedicines = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/restock/inventory/${deptId}`);
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
  
      if (data.length === 0) {
        console.warn("No medicines available for this department.");
      }
  
      console.log("Fetched medicines:", data);
      setMedicines(data);
    } catch (error) {
      console.error("Error fetching medicines:", error.message);
    }
  };
  

  const updateMinQuantity = async (medicineId, newThreshold) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/restock/inventory/${deptId}/${medicineId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ minimum_quantity: newThreshold }),
        }
      );

      if (!response.ok) throw new Error("Update failed");
      await fetchMedicines(); // Refresh table after update
    } catch (error) {
      console.error("Error updating threshold:", error);
      alert("Failed to update minimum quantity.");
    }
  };

  return (
    <div className="dept-details-container">
      <header className="de-header">
        <h1>Department Medicines</h1>
        <button onClick={() => navigate("/ad-inventory")}>Back to Departments</button>
      </header>

      <main className="dept-details-main">
        <h2>Medicines in Department</h2>
        <table className="medicines-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Current Quantity</th>
              <th>Minimum Quantity</th>
              <th>Update Minimum Quantity</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med) => (
              <tr key={med.medicine_id}>
                <td>{med.medicine_name}</td>
                <td>{med.current_quantity || 0}</td>
                <td>{med.minimum_quantity || 0}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    defaultValue={med.minimum_quantity || 0}
                    onBlur={(e) => {
                      const newVal = parseInt(e.target.value || 0);
                      if (newVal !== med.minimum_quantity) {
                        updateMinQuantity(med.medicine_id, newVal);
                      }
                    }}
                  />
                </td>
              </tr>
            ))}
            {medicines.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No medicines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default Details;
