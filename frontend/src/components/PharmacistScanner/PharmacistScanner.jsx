import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./PharmacistScanner.css";

const PharmacistScanner = () => {
    const [scannedData, setScannedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [scannerInstance, setScannerInstance] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        if (isScanning && !scannerInstance) {
            const scanner = new Html5QrcodeScanner("reader", {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            });

            scanner.render(
                (decodedText) => handleScan(decodedText, scanner),
                (errorMessage) => console.warn("QR scan error:", errorMessage)
            );
            setScannerInstance(scanner);
        }

        return () => {
            if (scannerInstance) {
                scannerInstance.clear().catch((err) => console.error("Error clearing scanner:", err));
                setScannerInstance(null);
            }
        };
    }, [isScanning, scannerInstance]);

    const handleScan = async (decodedText, scanner) => {
        try {
            setLoading(true);
            setError(null);
            console.log("Scanned QR Code Text:", decodedText);

            decodedText = decodedText.trim();
            let data;
            try {
                data = JSON.parse(decodedText);
                if (!data.batch_number || !data.expiry_date || !data.medicine_name || !data.total_units || !data.price) {
                    throw new Error("Missing required fields in QR data");
                }
            } catch (err) {
                console.error("QR Parsing Error:", err);
                setError("Invalid QR format. Please scan a valid QR.");
                setLoading(false);
                return;
            }

            setScannedData(data);

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/batches/scan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            setLoading(false);
            if (result.error) {
                setError(result.error);
            } else {
                alert("Batch added successfully! Batch ID: " + result.batch_id);
            }
        } catch (err) {
            console.error("Scan Processing Error:", err);
            setError("Failed to process scan. Please try again.");
            setLoading(false);
        }
    };

    const toggleScanner = () => {
        setIsScanning((prev) => !prev);
        if (scannerInstance) {
            scannerInstance.clear().catch((err) => console.error("Error stopping scanner:", err));
            setScannerInstance(null);
        }
    };

    return (
        <div className="scanner-container">
            <h2>Scan Medicine QR Code</h2>
            {isScanning ? (
                <div id="reader"></div>
            ) : (
                <button onClick={toggleScanner}>Start Scanning</button>
            )}
            {isScanning && <button onClick={toggleScanner}>Stop Scanning</button>}
            {loading && <p className="loading">Processing...</p>}
            {error && <p className="error">{error}</p>}
            {scannedData && !error && (
                <div className="scanned-result">
                    <h3>Scanned Data:</h3>
                    <pre>{JSON.stringify(scannedData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default PharmacistScanner;
