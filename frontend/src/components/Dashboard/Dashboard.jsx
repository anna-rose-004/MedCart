import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaTachometerAlt, FaBoxOpen, FaPills, FaFileInvoiceDollar, FaExclamationTriangle, FaWarehouse, FaBriefcase, FaEnvelope, FaPhone,FaCalendarAlt } from "react-icons/fa";
import "./Dashboard.css";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL_LOCAL;

const Dashboard = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();
  const [expiringCount, setExpiringCount] = useState(0);
  const [stock, setStock] = useState(0);
  const [recalled, setRecalled] = useState(0);
  const [nurseName, setNurseName] =useState("");

  const [nurseDetails, setNurseDetails] = useState({
      name: "ANNA",
      role: "Senior Nurse",
      experience: "5 years",
      email: "janedoe@example.com",
      phone: "+123 456 7890",
    });

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  useEffect(() => {
    const chatbotId = process.env.REACT_APP_CHATBOT_ID;

    window.chtlConfig = { chatbotId };

    if (!document.getElementById("chatling-embed-script")) {
        const script = document.createElement("script");
        script.src = "https://chatling.ai/js/embed.js";
        script.async = true;
        script.setAttribute("data-id", chatbotId);
        script.id = "chatling-embed-script";
        document.body.appendChild(script);
    }
}, []);


useEffect(() => {
  const fetchNurseDetails = async () => {
    try {
      const userId = localStorage.getItem("nurse_id");
      if (!userId) {
        console.error("No userId found in localStorage");
        return;
      }

      console.log("Fetching nurse profile for user ID:", userId);

      const response = await fetch(`${BACKEND_URL}/api/notifications/users/profile/${userId}`);
      const data = await response.json();

      console.log("API Response:", data);

      if (data.profile) {
        // Update nurseDetails state with the fetched data
        setNurseDetails({
          name: data.profile.name || "N/A",
          role: data.profile.role || "N/A",
          experience: data.profile.experience_years || "N/A",
          email: data.profile.email || "N/A",
          phone: data.profile.phone || "N/A",
        });
        
      } else {
        console.error("API did not return expected profile data:", data);
      }
    } catch (error) {
      console.error("Error fetching nurse's details:", error);
    }
  };

  fetchNurseDetails();
}, []);

  useEffect(() => {
    const fetchData = async (url, setData, isCount = false) => {
      try {
        const crashcartId = localStorage.getItem("crashcart_id") || 1;
        const response = await fetch(`${url}?crashcart_id=${crashcartId}`);
        const data = await response.json();
        setData(isCount ? data[Object.keys(data)[0]] || 0 : data.inventory || []);
      } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
      }
    };

    fetchData(`${BACKEND_URL}/api/unit-medicine/expiring-count`, setExpiringCount, true);
    fetchData(`${BACKEND_URL}/api/unit-medicine/stock-count`, setStock, true);
    fetchData(`${BACKEND_URL}/api/unit-medicine/recalled-count`, setRecalled, true);

    const interval = setInterval(() => {
      fetchData(`${BACKEND_URL}/api/unit-medicine/expiring-count`, setExpiringCount, true);
      fetchData(`${BACKEND_URL}/api/unit-medicine/stock-count`, setStock, true);
      fetchData(`${BACKEND_URL}/api/unit-medicine/recalled-count`, setRecalled, true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ndashboard-container">
      {/* Header */}
      <header className="nda-header">
        <h1>Welcome, {nurseDetails.name.split(" ")[0]  || "Nurse"}</h1> {/* Fallback to "Nurse" if name is not yet loaded */}
        <button className="nheader-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Sidebar */}
      <aside className="nsidebar">
        <ul className="nsidebar-menu">
          <li onClick={() => navigate("/nursedashboard")}>Dashboard</li>
          <li onClick={() => navigate("/calendar")}>Schedule</li>
          <li onClick={() => navigate("/notifications")}>Notifications</li>
          <li onClick={() => navigate("/history")}>Billing</li>
          <li onClick={() =>navigate("/inventory")}>Medicine Inventory</li>
          <li className="nlogout">Settings</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="nmain-content">
        <div className="ndashboard-grid">
          {/* Profile Button */}
          <button className="ndashboard-btn profile" onClick={handleProfile}>
            <FaUser className="nbtn-icon" /> Profile
          </button>

          {/* Other Buttons */}
          <button className="ndashboard-btn" onClick= {()=>navigate("/inventory")}>
            <FaTachometerAlt className="nbtn-icon" /> Inventory
          </button>
          <button className="ndashboard-btn" onClick={() => navigate("/scan-qrcode")}>
            <FaBoxOpen className="nbtn-icon" /> Restock
          </button>
          <button className="ndashboard-btn" onClick={() => navigate("/qrcode")}>
            <FaPills className="nbtn-icon" /> Dispense
          </button>
          <button className="ndashboard-btn">
            <FaFileInvoiceDollar className="nbtn-icon" /> Recalled
          </button>
          <button className="ndashboard-btn" onClick={() => navigate("/expired-medicines")}>
            <FaExclamationTriangle className="nbtn-icon" /> Expired Medicines
          </button>
          <button className="ndashboard-btn" onClick={() => navigate("/stock-medicines")}>
            <FaWarehouse className="nbtn-icon" /> In Stock
          </button>
        </div>
      </main>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="nchat-window">
          {/* Chat Header */}
          <div className="nchat-header">
            <h3>AI Chatbot</h3>
            <button className="nclose-chat" onClick={toggleChat}>
              &times;
            </button>
          </div>

          {/* Chat Body */}
          <div className="nchat-body">
            <div id="chatling-embed"></div>
          </div>
        </div>
      )}
      <aside className="nprofile-section">
        <div className="nprofile-card">
        <img src="https://img.freepik.com/premium-psd/contact-icon-illustration-isolated_23-2151903357.jpg?ga=GA1.1.1661170186.1740563891&semt=ais_hybrid" alt="Profile" className="nprofile-pic" />
      
          <h3>{nurseDetails.name}</h3>
          <p>{nurseDetails.role}</p>
      
          <div className="nprofile-info">
            <p><FaBriefcase /> <strong>Experience:</strong> {nurseDetails.experience}</p>
            <p><FaEnvelope /> <strong>Email:</strong> {nurseDetails.email}</p>
            <p><FaPhone /> <strong>Phone:</strong> {nurseDetails.phone}</p>
            <p><FaCalendarAlt /> <strong>Schedule:</strong> Mon-Fri, 9 AM - 5 PM</p>
          </div>
      
          <button className="nedit-profile" onClick={handleProfile}>Edit Profile</button>
        </div>
      </aside>

</div>
  );
}


export default Dashboard;