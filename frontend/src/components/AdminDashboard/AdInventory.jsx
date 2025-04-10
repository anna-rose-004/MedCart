import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css"; // Import the CSS file
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL_LOCAL;


const AdInventory = () => {
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  const handleDepartmentClick = (deptId) => {
    navigate(`/dept-detail/${deptId}`);
  };

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/restock/departments`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched departments:", data);
        if (Array.isArray(data)) {
          setDepartments(data);
        } else {
          console.error("Invalid data format for departments:", data);
          setDepartments([]); // fallback
        }
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
        setDepartments([]);
      });
  }, []);


  return (
    <div className="inventory-container">
      <header className="de-header">
        <h1>DEPARTMENTS</h1>
        <button onClick={() => navigate("/admin-dashboard")}>Back to Dashboard</button>
      </header>

      <main className="inventory-main">
        <h2 className="section-title">Select a Department</h2>
        <div className="department-list">
          {departments.length > 0 ? (
            departments.map((dept, index) => (
              <div key={dept.id || index} className="department-item" onClick={() => handleDepartmentClick(dept.id)}>
                {dept.location}
              </div>
            ))
          ) : (
            <p>No departments found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdInventory;
