import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import axios from "axios";
import "./PharmacistDashboard.css";
import { FaPills, FaHospital, FaQrcode, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL_LOCAL;

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const PharmacistDashboard = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState("dashboard"); // Track the current section
  const [unreadCount, setUnreadCount] = useState(0);
  const [restockRequests, setRestockRequests] = useState([]); // State for restocking requests

  // Fetch unread notifications count
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/notifications/unread-count`)
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.unreadCount))
      .catch((err) => console.error("Error fetching unread COUNT:", err));
  }, []);

  // Fetch restocking requests
  const fetchRestockRequests = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/restock-requests`);
      setRestockRequests(res.data);
    } catch (error) {
      console.error("Error fetching restock requests:", error);
    }
  };


  // Bar chart data
  const barData = {
    labels: ["Adrenaline", "Amiodarone", "Dopamine", "Vasopressin"],
    datasets: [
      {
        label: "ICU",
        backgroundColor: "rgba(75,192,192,0.4)",
        data: [5000, 8000, 7000, 3000],
      },
      {
        label: "Cardiology",
        backgroundColor: "rgba(153,102,255,0.4)",
        data: [3000, 5000, 2000, 1000],
      },
    ],
  };

  // Line chart data
  const lineData = {
    labels: ["Adrenaline", "Atropine", "Lidocaine", "Dopamine", "Vasopressin"],
    datasets: [
      {
        label: "2025",
        data: [3000, 2000, 4000, 5000, 8000],
        borderColor: "rgba(75,192,192,1)",
        fill: false,
      },
      {
        label: "2025",
        data: [2000, 1000, 2000, 2000, 1000],
        borderColor: "rgba(153,102,255,1)",
        fill: false,
      },
    ],
  };


  // Render the main dashboard
  return (
    <div className="ph-dashboard-container">
      <header className="ph-header">
        <h1>MEDCART</h1>
      </header>
      <div className="ph-dashboard">
        <aside className="ph-sidebar">
          <ul>
            <li>Dashboard</li>
            <li>Products</li>
            <li>Categories</li>
            <li onClick={() => navigate("/dept-dashboard")}>Departments</li>
            <li onClick={() => navigate("/batch-inventory")}>Inventory</li>
            <li>Reports</li>
            <li>Settings</li>
          </ul>
        </aside>
        <main className="ph-main-content">
          <div className="ph-stats">
            <div className="ph-card blue">
              <FaPills className="icon" />
              <h3>Medicines</h3>
            </div>
            <div className="ph-card orange">
              <FaHospital className="icon" />
              <h3>Restocking Requests</h3>
            </div>
            <div className="ph-card green" onClick={() => navigate("/pharmacist-qr-page")}>
              <FaQrcode className="icon" />
              <h3>Add Medicines</h3>
            </div>
            <div className="ph-card red" onClick={() => navigate("/notifications")}>
              <FaExclamationTriangle className="icon" />
              <h3>Alerts</h3>
              <p>{unreadCount}</p>
            </div>
          </div>
          <div className="ph-charts">
            <div className="ph-chart">
              <Bar data={barData} />
            </div>
            <div className="ph-chart">
              <Line data={lineData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PharmacistDashboard;