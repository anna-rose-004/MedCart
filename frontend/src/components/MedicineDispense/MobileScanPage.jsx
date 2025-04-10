import React, { useEffect, useContext } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import { DispenseContext } from "./MedicineDispense";

const MobileScanPage = () => {
  const { scannedMedicines, setScannedMedicines } = useContext(DispenseContext);
  const onScanSuccess = (decodedText) => {
    console.log("🟢 Scanned QR Code Data:", decodedText);
  
    try {
      const medicine = JSON.parse(decodedText);
  
      if (!medicine.unit_id || !medicine.batch_id || !medicine.name) {
        alert("❌ Invalid QR Code format");
        return;
      }
  
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/unit-medicine/scan-medicine`, medicine)
        .then((response) => {
          console.log("✅ Medicine scanned successfully:", response.data);
  
          // Fetch updated scanned medicines list after successful scan
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/scanned-medicines`)
            .then(res => res.json())
            .then(data => {
              console.log("🔄 Updated scanned medicines:", data);
              setScannedMedicines(data); // ✅ Updates the frontend list
            });
        })
        .catch((error) => {
          console.error("❌ Scan error:", error.response?.data || error.message);
          alert(error.response?.data?.error || "Scan error");
        });
  
    } catch (error) {
      console.error("❌ Error parsing QR code:", error);
      alert("Invalid QR Code format");
    }
  };

  const onScanFailure = (error) => {
    console.warn(`⚠️ QR Code scan error: ${error}`);
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(err => console.error("❌ Failed to clear scanner", err));
    };
  }, []);

  return (
    <div className="container">
      <h2>Scan Medicines</h2>
      <div id="reader"></div>
    </div>
  );
};

export default MobileScanPage;
