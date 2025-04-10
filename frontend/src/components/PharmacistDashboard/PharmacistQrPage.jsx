import React from "react";
import { QRCodeCanvas } from "qrcode.react"; 

const PharmacistQrPage = () => {
  const scannerUrl = `${process.env.REACT_APP_FRONTEND_URL}/pharmacist/scanner`; 

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Scan to Open Medicine Scanner</h2>
      <QRCodeCanvas value={scannerUrl} size={150} /> 
      <p>Scan this QR code with your mobile to open the medicine scanner.</p>
    </div>
  );
};

export default PharmacistQrPage;
