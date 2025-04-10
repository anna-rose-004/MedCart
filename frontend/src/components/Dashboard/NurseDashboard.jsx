import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './NurseDashboard.css'; // Import the CSS file
import { set } from 'date-fns';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL_LOCAL ; // Adjust the URL as needed

const NurseDashboard = () => {
  const navigate = useNavigate(); // Declare navigate once
  const [user, setUser] = useState(null);
  const [cartid, setCartid] = useState("");
  const [dept, setDept] = useState("");
  const [inventory, setInventory] = useState([]);
  const [stock, setStock] = useState(0);
  const [recalled, setRecalled]=useState(0);
  const [fulfilled, setFulFilled]=useState(0);

  const getCrashcartId = () => {
    let crashcartId = localStorage.getItem("crashcart_id");
    return crashcartId && crashcartId !== "undefined" ? Number(crashcartId) : 1;
  };

  const fetchData = async (url, setData, isCount = false) => {
    try {
      const crashcartId = getCrashcartId();
      const response = await fetch(`${url}?crashcart_id=${crashcartId}`);
      const data = await response.json();
      setData(isCount ? data[Object.keys(data)[0]] || 0 : data.inventory || []);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
  };
};

  useEffect(() => {
    //setting the cartid and dept from local storage
    const storedcartid = localStorage.getItem("crashcart_id");
    const storeddept = localStorage.getItem("dept");
    if(storedcartid){
      setCartid(`G00${storedcartid}`); // UI display
    }
    if(storeddept){
      setDept(storeddept.toUpperCase());
    }

    if (storedcartid) {
      fetchData(`${BACKEND_URL}/api/unit-medicine/to-fulfill`, setFulFilled, true);
    }
    // Fetch inventory data and counts
    fetchData(`${BACKEND_URL}/api/unit-medicine/inventory`, setInventory);
    fetchData(`${BACKEND_URL}/api/unit-medicine/stock-count`, setStock, true);
    fetchData(`${BACKEND_URL}/api/unit-medicine/recalled-count`, setRecalled, true);

    const interval = setInterval(() => {
      fetchData(`${BACKEND_URL}/api/unit-medicine/stock-count`, setStock, true);
      fetchData(`${BACKEND_URL}/api/unit-medicine/recalled-count`, setRecalled, true);
      fetchData(`${BACKEND_URL}/api/unit-medicine/to-fulfill`, setFulFilled, true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  const searchInventory = () => {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll(".inventory-row");

    rows.forEach((row, index) => {
      if (index === 0) return; // Skip header row
      const medicineName = row.querySelector(".column.name")?.textContent.toLowerCase();
      row.style.display = medicineName.includes(input) ? "flex" : "none";
    });
  };

  const handleClick = () => {
    console.log("QR Code section clicked!");
    // Additional action if needed
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");};

  // Define handleScan to navigate to the QR code page
  const handleScan = () => {
    navigate("/scan-qrcode");
  };

  const handleStock = () => {
    navigate("/stock-medicines");};

  const handleExpired = () => {
    navigate("/expired-medicines");}; 
  
  const handleDispense = () => {
    navigate("/qrcode");};
  
    const handleHistory = () =>{
      navigate("/history");
    };
  

  return (
    <div className="nsdashboard-container">
      <header className="nsda-header">
        <h1>MEDCART</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      
      <main>
      <aside className="nssidebar">
      <ul>
        <li onClick={() => navigate("/Dashboard")}>Dashboard</li>
        <li onClick={() => navigate("/profile")}>Profile</li>
        <li onClick={() => navigate("/Dashboard")}>Analytics</li>
        <li onClick={() => navigate("/notifications")}>Notifications</li>
        <li onClick={() => navigate("/Calendar")}>Schedule</li>
        <li onClick={() => navigate("/Dashboard")}>Billing</li>
        <li onClick={() => navigate("/history")}>Dispensed History</li>
      </ul>
    </aside>

        <section className="real-time-monitoring">
          <h2><i className="fas fa-heartbeat"></i> Consignment Notifications</h2>
          <p>Status: <span className="status" aria-live="polite">Idle</span></p>
          <div className="status-container">
          <div className="expiring-items" onClick={handleExpired}
          style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}>
            <h3>{recalled}</h3>
            <p>Expired</p>
          </div>
          <div className="stock" onClick={handleStock}
          style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}>
            <h3>{stock}</h3>
            <p>Stock</p>
          </div>
          <div className="recalled-product">
            <h3>{fulfilled}</h3>
            <p>Recalled</p>
          </div>
        </div>

        </section>

        <section className="QRCode2" onClick={handleDispense}
          style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}>
          <h2><i className="fa-solid fa-qrcode"></i> DISPENSE</h2>
          <p className='qr'>Scan to Dispense item</p>
        </section>

        <section
          className="QRCode1"
          onClick={handleScan}
          style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}
        >
          <h2><i className="fa-solid fa-qrcode"></i> RESTOCK</h2>
          <p className='qr'>Scan to Add item</p>
        </section>

        <section className="cartid">
          <h2><span className="material-symbols-outlined"></span> Cartid {cartid}</h2>
          <p><span className="dep" aria-live="polite">{dept}</span></p>
        </section>
        
        {/* Inventory Table */}
        <section className="nsinventory-table">
        <h2>Inventory Records</h2>
        <div className="nsinventory-search">
          <input type="text" id="searchInput" placeholder="Search for medicine..." onKeyUp={searchInventory} />
        </div>

        <div className="nsinventory-record">
          <div className="nsinventory-row header">
            <div className="nscolumn name">Name</div>
            <div className="nscolumn quantity">Qty</div>
          </div>
          {inventory.length > 0 ? (
            inventory.map((item, index) => (
              <div key={index} className="nsinventory-row">
                <div className="nscolumn name">{item.medicine_name}</div>
                <div className="nscolumn quantity">{item.quantity}</div>
              </div>
            ))
          ) : (
            <div className="nsinventory-row">
              <div className="nscolumn name">No records found.</div>
            </div>
          )}
        </div>
      </section>
      </main>
    </div>
  );
};

export default NurseDashboard;
