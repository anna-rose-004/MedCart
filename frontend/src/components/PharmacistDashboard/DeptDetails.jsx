import React from "react";
import { useParams, Link } from "react-router-dom";

const departments = [
  { id: 1, name: "ICU", description: "Critical care unit" },
  { id: 2, name: "Cardiology", description: "Heart disease unit" },
  { id: 3, name: "Neurology", description: "Brain and nerve unit" },
  { id: 4, name: "Oncology", description: "Cancer treatment unit" },
  { id: 5, name: "Orthopedics", description: "Bone and joint care" },
];

const DeptDetailPage = () => {
  const { id } = useParams();
  const department = departments.find((dept) => dept.id === parseInt(id));

  if (!department) {
    return <h2 style={{ textAlign: "center", padding: "20px" }}>Department Not Found</h2>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{department.name}</h1>
      <p style={styles.desc}>{department.description}</p>
      <Link to="/departments" style={styles.backButton}>⬅ Back to Departments</Link>
    </div>
  );
};

const styles = {
  container: { textAlign: "center", padding: "30px", background: "#f8f9fa", minHeight: "100vh" },
  title: { fontSize: "28px", color: "#222" },
  desc: { fontSize: "18px", marginBottom: "20px", color: "#555" },
  backButton: {
    display: "inline-block",
    padding: "12px 25px",
    background: "linear-gradient(135deg, #ff4b5c, #ff6b81)",
    color: "#fff",
    borderRadius: "5px",
    textDecoration: "none",
    fontSize: "18px",
    transition: "background 0.3s",
  },
};

export default DeptDetailPage;
