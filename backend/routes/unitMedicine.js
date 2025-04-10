const express = require("express");
const QRCode = require("qrcode");

console.log("🟢 unitMedicine routes loaded");
module.exports = (db, io) => {
  const router = express.Router();

  // Generate QR code for the scanning page
  router.get("/generate-qrcode", async (req, res) => {
    try {
      const frontendUrl = process.env.REACT_APP_FRONTEND_URL;
      const nurseId = req.query.nurse_id;
      const scanUrl = nurseId 
        ? `${frontendUrl}/scan-unit-medicine?nurse_id=${nurseId}` 
        : `${frontendUrl}/scan-unit-medicine`;
      const qrCodeData = await QRCode.toDataURL(scanUrl);
      res.json({ success: true, qrCode: qrCodeData, scanUrl });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  });  

  // Store scanned unit medicine details
  router.post("/store-unit", (req, res) => {
    const { unit_id, batch_id, name, nurse_id } = req.body;
    if (!unit_id || !batch_id || !name || !nurse_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    // Find the nurse's assigned crash cart
    console.log("Nurse ID:", nurse_id);
    const getCrashcartSql = `
    SELECT c.cart_id 
    FROM users u 
    LEFT JOIN crashcarts c ON LOWER(u.dept) = LOWER(c.location)
    WHERE u.user_id = ? LIMIT 1`;

db.query(getCrashcartSql, [nurse_id], (err, nurseResults) => {
    if (err) {
        console.error(" SQL Error:", err.message);
        return res.status(500).json({ error: err.message });
    }
    if (nurseResults.length === 0 || !nurseResults[0].cart_id) {
        console.warn(" Nurse ID found but no linked crash cart.");
        return res.status(404).json({ error: "Nurse found, but department is not linked to any crash cart." });
    }

    const crashcart_id = nurseResults[0].cart_id;
    console.log(` Nurse linked to Crash Cart ID: ${crashcart_id}`);

    // Proceed with inserting the medicine
    const insertSql = `
        INSERT INTO unit_medicine (unit_id, batch_id, name, crashcart_id) 
        VALUES (?, ?, ?, ?)`;

    db.query(insertSql, [unit_id, batch_id, name, crashcart_id], (err2, result) => {
        if (err2) {
            if (err2.code === "ER_DUP_ENTRY") {
                return res.status(400).json({ error: "Medicine already added." });
            }
            console.error(" Insert Error:", err2.message);
            return res.status(500).json({ error: err2.message });
        }
        res.json({ success: true, message: "Medicine added successfully!", id: result.insertId, crashcart_id });
    });
});

  });

  router.get("/inventory", (req, res) => {
    const crashcart_id = req.query.crashcart_id;

    if (!crashcart_id) {
      return res.status(400).json({ error: "Missing crashcart_id parameter" });
    }
  
    const inventorySql = `
    SELECT um.name AS medicine_name, COUNT(*) AS quantity, b.expiry_date
    FROM unit_medicine um
    JOIN batches b ON um.batch_id = b.batch_number AND um.name = b.name  
    WHERE um.crashcart_id = ? AND um.dispensed = 0
    GROUP BY um.name, b.expiry_date
    ORDER BY um.name `;
  
    db.query(inventorySql, [crashcart_id], (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: err.message });
      }  
      res.json({ success: true, inventory: results });
    });
  });
  
  // API: Count of expiring medicines (within 30 days)
router.get("/expiring-count", (req, res) => {
  const crashcart_id = req.query.crashcart_id;

  if (!crashcart_id) {
    return res.status(400).json({ error: "Missing crashcart_id parameter" });
  }
  const today = new Date().toISOString().split("T")[0];
  const expiringThreshold = new Date();
  expiringThreshold.setDate(expiringThreshold.getDate() + 30);
  const expiringDate = expiringThreshold.toISOString().split("T")[0];

  const query =  `
  SELECT COUNT(DISTINCT um.id) AS expiring_count  
    FROM unit_medicine um  
    JOIN batches b ON um.batch_id = b.batch_number  
    WHERE um.crashcart_id = ? AND um.dispensed = 0
    AND b.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)`;

  db.query(query, [crashcart_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result[0]);
  });
});

// API: Count of total stock
router.get("/stock-count", (req, res) => {
  const crashcart_id = req.query.crashcart_id;

  if (!crashcart_id) {
    return res.status(400).json({ error: "Missing crashcart_id parameter" });
  }
  const query = `SELECT COUNT(*) AS non_expired_count 
  FROM unit_medicine um
  JOIN batches b 
      ON um.batch_id = b.batch_number 
      AND um.name = b.name  
  JOIN crashcarts cc 
      ON um.crashcart_id = cc.cart_id
  WHERE um.crashcart_id = ? 
  AND b.expiry_date >= CURDATE() AND um.dispensed = 0`;

  db.query(query, [crashcart_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result[0]);
  });
});

//API for recalled count
router.get("/recalled-count", (req, res) => {
  const crashcart_id = req.query.crashcart_id;

  if (!crashcart_id) {
    return res.status(400).json({ error: "Missing crashcart_id parameter" });
  }

  const query = `SELECT COUNT(*) AS expired_count
  FROM unit_medicine um
  JOIN batches b ON um.batch_id = b.batch_number 
  AND um.name = b.name  -- Ensuring correct medicine batch mapping
  WHERE um.crashcart_id = ?  
  AND b.expiry_date < CURDATE() 
  AND um.dispensed = 0`; // Exclude dispensed medicines
  
  db.query(query, [crashcart_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(result[0]);
  });
}) ;

//API for expired medicines list
router.get("/expired-medicines", (req, res) => {
  const crashcart_id = req.query.crashcart_id;
  if (!crashcart_id || isNaN(crashcart_id)) {
    return res.status(400).json({ error: "Invalid or missing crashcart_id" });
  }

  const query = `SELECT um.name AS medicine_name, um.unit_id, um.batch_id, b.expiry_date 
                  FROM unit_medicine um JOIN batches b ON um.batch_id = b.batch_number 
                AND um.name = b.name JOIN crashcarts cc 
                ON um.crashcart_id = cc.cart_id WHERE um.crashcart_id = ?  
                AND b.expiry_date < CURDATE() AND um.dispensed = 0  
                ORDER BY b.expiry_date ASC`;

  db.query(query, [parseInt(crashcart_id)], (err, results) => {
    if (err) {
      console.error(" Database Error:", err.sqlMessage || err);
      return res.status(500).json({ error: err.sqlMessage || "Database error" });
    }
    res.json(results);
  });
});


// Fetch  Medicines in stock List
router.get("/stock-medicines", (req, res) => {
  const crashcart_id = req.query.crashcart_id;
  if (!crashcart_id || isNaN(crashcart_id)) {
    return res.status(400).json({ error: "Invalid or missing crashcart_id" });
  }

  const query =  `
  SELECT um.name AS medicine_name, um.unit_id, um.batch_id, b.expiry_date 
  FROM unit_medicine um
  JOIN batches b 
      ON um.batch_id = b.batch_number 
      AND um.name = b.name  
  JOIN crashcarts cc 
      ON um.crashcart_id = cc.cart_id
  WHERE um.crashcart_id = ? 
  AND b.expiry_date >= CURDATE()  
  AND um.dispensed = 0  
  ORDER BY b.expiry_date ASC;
`;

  db.query(query, [parseInt(crashcart_id)], (err, results) => {
    if (err) {
      console.error(" Database Error:", err.sqlMessage || err);
      return res.status(500).json({ error: err.sqlMessage || "Database error" });
    }
    res.json(results);
  });
});

router.get("/to-fulfill", (req, res) => {
  const crashcart_id = req.query.crashcart_id;

  if (!crashcart_id || isNaN(crashcart_id)) {
    return res.status(400).json({ error: "Invalid or missing crashcart_id" });
  }

  const query = `
    SELECT 
        SUM(GREATEST(dma.minimum_quantity - COALESCE(stock.current_quantity, 0), 0)) AS total_medicines_to_fulfill
    FROM department_medicine_allocation dma
    LEFT JOIN (
        SELECT 
            um.crashcart_id,
            um.name AS medicine_name,
            COUNT(
                CASE 
                    WHEN um.unit_id IS NOT NULL AND um.dispensed = 0 AND b.expiry_date >= CURDATE()
                    THEN um.unit_id 
                    ELSE NULL 
                END
            ) AS current_quantity
        FROM unit_medicine um
        JOIN batches b ON b.batch_number = um.batch_id
        GROUP BY um.crashcart_id, um.name
    ) AS stock ON stock.crashcart_id = dma.crashcart_id AND stock.medicine_name = (SELECT name FROM medicines WHERE medicine_id = dma.medicine_id)
    WHERE dma.crashcart_id = ?;
  `;

  db.query(query, [parseInt(crashcart_id)], (err, results) => {
    if (err) {
      console.error("Database Error:", err.sqlMessage || err);
      return res.status(500).json({ error: err.sqlMessage || "Database error" });
    }
    
    // If no result found, return 0
    const totalMedicinesToFulfill = results.length > 0 ? results[0].total_medicines_to_fulfill : 0;

    res.json({ crashcart_id, total_medicines_to_fulfill: totalMedicinesToFulfill });
  });
});


router.delete("/remove-expired/:unit_id/:batch_id/:name", (req, res) => {
  const { unit_id, batch_id, name } = req.params;
  const removedBy = req.headers["removed-by"] || "admin"; 

  console.log(` Removing Expired Medicine: ${name} (Unit ID: ${unit_id}, Batch ID: ${batch_id}) by ${removedBy}`);

  const getExpiryDateSql = `SELECT expiry_date FROM batches WHERE batch_number = ? LIMIT 1`;

  db.query(getExpiryDateSql, [batch_id], (err, result) => {
    if (err) {
      console.error(" Database Fetch Error:", err.message);
      return res.status(500).json({ error: "Database Fetch Error", details: err.message });
    }
    if (result.length === 0 || !result[0].expiry_date) {
      console.warn("No expiry date found for batch number:", batch_id);
      return res.status(500).json({ error: "No expiry date found for this batch." });
    }

    const expiryDate = result[0].expiry_date;
    console.log(` Expiry Date Found: ${expiryDate}`);

    // Insert into `removed_medicines` (FIXED: Using `batch_id` instead of `batch_number`)
    const insertAuditSql = `INSERT INTO removed_medicines (unit_id, batch_id, name, expiry_date, removed_by) 
                            VALUES (?, ?, ?, ?, ?)`;
    
    db.query(insertAuditSql, [unit_id, batch_id, name, expiryDate, removedBy], (err2) => {
      if (err2) {
        console.error(" Error Inserting into removed_medicines:", err2.message);
        return res.status(500).json({ error: "Audit Insert Error", details: err2.message });
      }

      console.log(` ${name} Logged in Audit Table by ${removedBy}`);

      //  attempt deletion
      const deleteSql = `DELETE FROM unit_medicine WHERE unit_id = ? AND batch_id = ? AND name = ?`;
      console.log("🗑️ Executing Delete Query:", deleteSql, [unit_id, batch_id, name]);

      db.query(deleteSql, [unit_id, batch_id, name], (err3, result3) => {
        if (err3) {
          console.error(" Database Delete Error:", err3.message);
          return res.status(500).json({ error: "Database Delete Error", details: err3.message });
        }

        if (result3.affectedRows === 0) {
          console.warn(" No rows were deleted. Possible foreign key constraint.");
          return res.status(404).json({ error: "No matching record found to delete." });
        }

        console.log(`Expired Medicine ${name} removed successfully.`);
        res.json({ success: true, message: `Expired Medicine ${name} removed successfully.` });
      });
    });
  });
});


/**
 * Scan medicine for dispensing
 */

router.post("/scan-medicine", (req, res) => {
  console.log(" Received Scan Request:", req.body);

  const { unit_id, batch_id, name } = req.body;
  if (!unit_id || !batch_id || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const checkDuplicateSql = `SELECT * FROM unit_medicine WHERE unit_id = ? AND batch_id = ? AND name = ? AND dispensed = 1`;

  db.query(checkDuplicateSql, [unit_id, batch_id, name], (err, duplicateResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (duplicateResults.length > 0) {
      console.log(" Duplicate scan detected!");
      return res.status(400).json({ error: "Duplicate scan detected! Medicine already dispensed." });
    }

    const checkExpiryAndPriceSql = `SELECT expiry_date, price FROM batches WHERE batch_number = ? AND name = ?`;
    db.query(checkExpiryAndPriceSql, [batch_id, name], (err2, results) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (results.length === 0) return res.status(404).json({ error: "Batch not found" });

      const expiryDate = new Date(results[0].expiry_date);
      if (expiryDate < new Date()) {
        return res.status(400).json({ error: "Medicine expired! Cannot dispense." });
      }

      const price = results[0].price || 0;
      const medicineData = { unit_id, batch_id, name, price };

      console.log(" Emitting WebSocket Event: medicine-scanned", medicineData);
      io.emit("medicine-scanned", medicineData); 

      res.json({ success: true, message: "Medicine scanned successfully!", medicineData });
    });
  });
});

/**
* Dispense Medicine
*/
router.post("/dispense", (req, res) => {
  let { unit_id, batch_id, name, patient_id, nurse_id, price } = req.body;

  console.log(" Received Dispense Request:", req.body); 

  if (!unit_id || !batch_id || !patient_id || !nurse_id || price === undefined) {
    console.error(" Missing required fields in dispense request.");
    return res.status(400).json({ error: "Missing required fields" });
  }

  //  Ensure `name` is fetched if missing
  if (!name) {
    const getNameSql = `SELECT name FROM unit_medicine WHERE unit_id = ? AND batch_id = ? LIMIT 1`;
    db.query(getNameSql, [unit_id, batch_id], (err, result) => {
      if (err) {
        console.error(" Database error:", err.message);
        return res.status(500).json({ error: err.message });
      }
      if (result.length === 0) {
        console.error("Medicine not found in database.");
        return res.status(404).json({ error: "Medicine not found" });
      }

      name = result[0].name; // Get the name from the database
      processDispensing(unit_id, batch_id, name, patient_id, nurse_id, price, res);
    });
  } else {
    processDispensing(unit_id, batch_id, name, patient_id, nurse_id, price, res);
  }
});

//  Process dispensing and log any errors
function processDispensing(unit_id, batch_id, name, patient_id, nurse_id, price, res) {
  console.log(` Processing Dispensing: ${name}, Unit ID: ${unit_id}, Batch: ${batch_id}`);

  const dispenseSql = `
    INSERT INTO dispensing (unit_id, batch_id, name, patient_id, nurse_id, dispense_time, price) 
    VALUES (?, ?, ?, ?, ?, NOW(), ?)`;
  
  db.query(dispenseSql, [unit_id, batch_id, name, patient_id, nurse_id, price], (err, result) => {
    if (err) {
      console.error(" Database Insert Error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    console.log("Dispensing Inserted:", result);

    //  Update `dispensed` flag in `unit_medicine`
    const updateStockSql = `UPDATE unit_medicine SET dispensed = 1 WHERE unit_id = ? AND batch_id = ? AND name = ?`;
    db.query(updateStockSql, [unit_id, batch_id, name], (err2, result2) => {
      if (err2) {
        console.error(" Database Update Error:", err2.message);
        return res.status(500).json({ error: err2.message });
      }

      console.log(" Medicine marked as dispensed:", result2);
      res.json({ success: true, message: `Medicine ${name} dispensed successfully!` });
    });
  });
}
/**
* Fetch Patient Details
*/
router.get("/patient/:id", (req, res) => {
  const patientId = req.params.id;
  console.log(" Received patient lookup request for ID:", patientId); // Debugging log

  const sql = "SELECT * FROM patients WHERE patient_id = ?";
  db.query(sql, [patientId], (err, result) => {
    if (err) {
      console.error(" Database error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      console.log(" Patient not found:", patientId);
      return res.status(404).json({ error: "Patient not found" });
    }
    
    console.log(" Patient found:", result[0]);
    res.json(result[0]);
  });
});

router.get("/dispensed-history", (req, res) => {
  const { nurse_id, patient_id, start_date, end_date } = req.query;

  let sql = `SELECT d.dispense_id, d.unit_id, d.batch_id, d.name, d.patient_id, 
                    p.name AS patient_name, d.nurse_id, d.dispense_time, d.price 
             FROM dispensing d
             JOIN patients p ON d.patient_id = p.patient_id
             WHERE 1=1`;

  const params = [];

  if (nurse_id && nurse_id.trim() !== "") {
    sql += " AND d.nurse_id = ?";
    params.push(nurse_id);
  }

  if (patient_id && patient_id.trim() !== "") {
    sql += " AND d.patient_id = ?";
    params.push(patient_id);
  }

  if (start_date && start_date.trim() !== "" && end_date && end_date.trim() !== "") {
    sql += " AND d.dispense_time BETWEEN ? AND ?";
    params.push(start_date, end_date);
  }

  sql += " ORDER BY d.dispense_time DESC";


  db.query(sql, params, (err, results) => {
    if (err) {
      console.error(" Database Error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

  return router;
};
