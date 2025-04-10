import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css"; // Import the CSS file
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL_LOCAL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showAddUserForm, setShowAddUserForm] = useState(false); // Toggle between dashboard and form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Nurse",
    department: "",
  });

  const handleLogout = () => {
    navigate("/login"); // Redirect to login page after logout
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log("New User Data:", formData);
  
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("User registered successfully!");
        setShowAddUserForm(false); // Return to dashboard after submission
      } else {
        alert("Registration failed: " + data.message);
      }
    } catch (error) {
      console.error("Error registering user:", error);
      alert("An error occurred while registering the user.");
    }
  };
  

  if (showAddUserForm) {
    // Render the "Add New User" form
    return (
      <div className="ad-container">
        <header className="da-header">
          <h1>MEDCART</h1>
          <button onClick={handleLogout}>Logout</button>
        </header>
        <main className="add-user-container">
          <h2>Add New User</h2>
          <form className="add-user-form" onSubmit={handleFormSubmit} autoComplete="off">
            <div>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="off"
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label htmlFor="role">Role:</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="Nurse">Nurse</option>
                <option value="Pharmacist">Pharmacist</option>
              </select>
            </div>
            {formData.role === "Nurse" && (
              <div>
                <label htmlFor="department">Department:</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="ICU">ICU</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Oncology">Oncology</option>
                </select>
              </div>
            )}
            <button type="submit">Register User</button>
            <button
              type="button"
              className="cancel-button"
              onClick={() => setShowAddUserForm(false)}
            >
              Cancel
            </button>
          </form>
        </main>
      </div>
    );
  }

  // Render the dashboard view
  return (
    <div>
      <header className="da-header">
        <h1>MEDCART</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <main className="admin-dashboard">
        <div className="dashboard-grid">
          <div className="dashboard-card" onClick={() => navigate("/ad-inventory")}>
            <h3>Inventory</h3>
          </div>
          <div className="dashboard-card">
            <h3>Departments</h3>
          </div>
          <div className="dashboard-card">
            <h3>Medicines</h3>
          </div>
          <div className="dashboard-card">
            <h3>Patient Management</h3>
          </div>
          <div
            className="dashboard-card"
            onClick={() => setShowAddUserForm(true)}
          >
            <h3>Add New User</h3>
          </div>
          {/* Add more cards as needed */}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;