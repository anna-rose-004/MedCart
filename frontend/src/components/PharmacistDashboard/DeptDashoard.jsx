import React from "react";
import { Link } from "react-router-dom";
import './DeptDashboard.css';

const departments = [
  { id: 1, name: "ICU", description: "Critical care unit" },
  { id: 2, name: "Cardiology", description: "Heart disease unit" },
  { id: 3, name: "Neurology", description: "Brain and nerve unit" },
  { id: 4, name: "Oncology", description: "Cancer treatment unit" },
  { id: 5, name: "Orthopedics", description: "Bone and joint care" },
];

const DeptDashboard = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🏥 Department Dashboard</h1>
      <div style={styles.grid}>
        {departments.map((dept) => (
          <Link key={dept.id} to={`/departments/${dept.id}`} style={styles.card}>
            <h2 style={styles.cardTitle}>{dept.name}</h2>
            <p style={styles.cardDesc}>{dept.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { textAlign: "center", padding: "30px", background: "#f4f6f9", minHeight: "100vh" },
  heading: { fontSize: "32px", color: "#333", marginBottom: "20px" },
  grid: { display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "20px" },
  card: {
    width: "250px",
    padding: "20px",
    background: "linear-gradient(135deg, #f9f9f9, #e3f2fd)",
    color: "#333",
    borderRadius: "10px",
    textDecoration: "none",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
    transition: "transform 0.2s, box-shadow 0.3s",
    textAlign: "center",
  },
  cardTitle: { fontSize: "22px", fontWeight: "bold" },
  cardDesc: { fontSize: "16px", opacity: "0.9" },
  cardHover: { transform: "scale(1.05)", boxShadow: "0px 6px 15px rgba(0,0,0,0.3)" },
};

export default DeptDashboard;
