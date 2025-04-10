import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useLocation } from "react-router-dom";

// Helper hook to extract URL query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ScanUnitMedicine = () => {
  const [error, setError] = useState(null);
  const query = useQuery();
  
  // Check if nurse_id exists in localStorage; if not, try to get it from URL
  let nurse_id = query.get("nurse_id") || localStorage.getItem("nurse_id");

if (nurse_id) {
  localStorage.setItem("nurse_id", nurse_id); // update or save it
} else {
  // handle error if neither found
  alert("Nurse ID not found. Please login again.");
}

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    });

    scanner.render(handleScan, (errMessage) => {
      console.warn("QR scan error:", errMessage);
    });

    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner:", err));
    };
  }, []);

  const handleScan = async (decodedText) => {
    try {
      console.log("Raw scanned text:", decodedText);
      const trimmedText = decodedText.trim();
      console.log("Trimmed text:", trimmedText);
      
      const data = JSON.parse(trimmedText);
      console.log("Parsed data:", data);
      console.log("Parsed keys:", Object.keys(data));
      
      if (!data.unit_id || !data.batch_id || !data.name) {
        throw new Error("Invalid QR Code data: missing required fields");
      }
      
      // Now nurse_id should be available either from localStorage or from the URL
      if (!nurse_id) {
        throw new Error("Nurse ID not found. Please log in again.");
      }
      
      const requestData = { ...data, nurse_id };
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/unit-medicine/store-unit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });
      const result = await response.json();
      if (result.error) {
        setError(result.error);
      } else {
        alert(`Unit Medicine Added to Crash Cart ${result.crashcart_id}!`);
      }
    } catch (err) {
      console.error("Error processing scan:", err);
      setError(err.message || "Failed to process scan. Please try again.");
    }
  };

  return (
    <div>
      <h2>Scan Unit Medicine QR Code</h2>
      <div id="reader" style={{ width: "300px" }}></div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ScanUnitMedicine;
