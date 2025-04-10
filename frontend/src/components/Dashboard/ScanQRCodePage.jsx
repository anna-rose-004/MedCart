import React, { useState, useEffect } from "react";
import './StockMedicines.css';

const ScanQRCodePage = () => {
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    const generateQrCode = async () => {
      try {
        const nurseId = localStorage.getItem("nurse_id"); // This is available on the desktop
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/unit-medicine/generate-qrcode?nurse_id=${nurseId}`);
        const data = await response.json();
        if (data.success) {
          setQrCode(data.qrCode);
        }
      } catch (err) {
        console.error("Error generating QR code:", err);
      }
    };
  
    generateQrCode();
  }, []);

  return (
    <div classname="qrocde-page">
      <h2>Scan QR Code to Add Unit Medicine</h2>
      {qrCode ? (
        <div>
          <img src={qrCode} alt="QR Code for scanning unit medicine" style={{ maxWidth: "300px" }} />
        </div>
      ) : (
        <p>Generating QR Code...</p>
      )}
    </div>
  );
};

export default ScanQRCodePage;
