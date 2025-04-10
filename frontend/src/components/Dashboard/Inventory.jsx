import React, { useState, useEffect } from "react";
import "./Dashboard.css";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL_LOCAL ;

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const abortController = new AbortController();

    const fetchInventory = async () => {
      try {
        const crashcartId = localStorage.getItem("crashcart_id") || 1;
        const response = await fetch(
          `${BACKEND_URL}/api/unit-medicine/inventory?crashcart_id=${crashcartId}`,
          { signal: abortController.signal }
        );
        const data = await response.json();
        setInventory(data.inventory || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching inventory:", error);
        }
      }
    };

    fetchInventory();
    return () => abortController.abort(); // Cleanup function
  }, []);

  const filteredInventory = inventory.filter((item) =>
    item.medicine_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inventory-container">
      <input
        type="text"
        placeholder="Search medicines..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      <div className="inventory-table">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length > 0 ? (
              filteredInventory.map((item, index) => (
                <tr key={index}>
                  <td>{item.medicine_name}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" style={{ textAlign: "center" }}>No medicines found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
