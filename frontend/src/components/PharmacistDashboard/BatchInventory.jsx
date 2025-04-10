import { useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import "./BatchInventory.css"; 
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL_LOCAL; 

function BatchInventory() {
  const [batches, setBatches] = useState([]);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-GB").format(new Date(dateString)); 
  };

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/batches/withMedicines`) 
      .then((res) => res.json())
      .then((data) => setBatches(data))
      .catch((err) => console.error("Error fetching batches:", err));
  }, []);

  return (
    <div className="binventory-container">
      <h2 className="btitle">Batch Medicines</h2>
      <table className="binventory-table">
        <thead>
          <tr>
            <th className="bhead">S. No</th>
            <th className="bhead">Medicine Name</th>
            <th className="bhead">Expiry Date</th>
            <th className="bhead">Total Units</th>
            <th className="bhead">Price</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch,index) => (
            <tr key={batch.batch_id}>
              <td className="details">{index + 1}</td> 
              <td className="details">{batch.medicine_name}</td>
              <td>
              <span className={`expiry-text ${getExpiryClass(batch.expiry_date).className}`}>
              {formatDate(batch.expiry_date)} {getExpiryClass(batch.expiry_date).icon}
              </span>
            </td>
              <td className="details">{batch.total_units}</td>
              <td className="details">{batch.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Function to add colors to expiry dates
const getExpiryClass = (expiryDate) => {
  const today = new Date();
  const expDate = new Date(expiryDate);
  const diffDays = (expDate - today) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) {
    return { className: "expiry-red", icon: <FaExclamationTriangle className="expired-icon" />, text: "Expired" };
  } else if (diffDays <= 7) {
    return { className: "expiry-orange", icon: null, text: "Expiring Soon" };// Expiring soon (within 7 days)
  } else {
    return { className: "expiry-green", icon: null, text: "Safe" }; // Safe
  }
};


export default BatchInventory;
