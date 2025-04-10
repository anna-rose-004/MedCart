const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // Get inventory for a department (crashcart) including all medicines
  router.get("/inventory/:crashcart_id", async (req, res) => {
    const { crashcart_id } = req.params;
    console.log(`Fetching inventory for crashcart_id: ${crashcart_id}`);
  
    try {
      const [results] = await db.promise().query(`
        SELECT 
          m.medicine_id,
          m.name AS medicine_name,
          m.manufacturer,
          m.dosage_form,
          m.category,
          COALESCE(dma.minimum_quantity, 0) AS minimum_quantity,
          COUNT(um.unit_id) AS current_quantity
        FROM medicines m
        LEFT JOIN department_medicine_allocation dma 
          ON dma.medicine_id = m.medicine_id AND dma.crashcart_id = ?
        LEFT JOIN unit_medicine um 
          ON um.name = m.name AND um.crashcart_id = ? AND um.dispensed = 0
        GROUP BY 
          m.medicine_id, m.name, m.manufacturer, m.dosage_form, m.category, dma.minimum_quantity
        ORDER BY m.name
      `, [crashcart_id, crashcart_id]);
  
      console.log(`Query results:`, results);
      res.json(results.length ? results : []);
    } catch (err) {
      console.error(`Inventory fetch error for crashcart ${crashcart_id}:`, err);
      res.status(500).json({ error: err.message });
    }
  });
  
  router.put("/inventory/:crashcart_id/:medicine_id", async (req, res) => {
    const { crashcart_id, medicine_id } = req.params;
    const { minimum_quantity } = req.body;
  
    console.log("Updating minimum quantity:");
    console.log("Crashcart ID:", crashcart_id);
    console.log("Medicine ID:", medicine_id);
    console.log("Minimum Quantity:", minimum_quantity);
  
    try {
      const query = `
        INSERT INTO department_medicine_allocation 
          (crashcart_id, medicine_id, minimum_quantity, current_quantity)
        VALUES (?, ?, ?, 0)
        ON DUPLICATE KEY UPDATE minimum_quantity = ?
      `;
  
      await db.promise().query(query, [
        crashcart_id,
        medicine_id,
        minimum_quantity,
        minimum_quantity,
      ]);
  
      res.json({ message: "Minimum quantity updated successfully." });
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).json({ error: err.message });
    }
  });
  

  // Nurses send restock request manually
  router.post("/request-restock", async (req, res) => {
    const { crashcart_id, medicine_id, requested_quantity } = req.body;

    try {
      const insertQuery = `INSERT INTO restock_requests (crashcart_id, medicine_id, requested_quantity, status) VALUES (?, ?, ?, 'Pending')`;
      await db.query(insertQuery, [crashcart_id, medicine_id, requested_quantity]);

      req.io.emit("restock_request", {
        crashcart_id,
        medicine_id,
        requested_quantity
      });

      res.json({ message: "Restock request submitted successfully." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Pharmacists get pending restock requests
  router.get("/pending-restocks", async (req, res) => {
    try {
      const query = `
        SELECT r.request_id, r.crashcart_id, r.medicine_id, r.requested_quantity, d.name AS department_name, m.name AS medicine_name
        FROM restock_requests r
        JOIN crashcarts d ON r.crashcart_id = d.crashcart_id
        JOIN medicines m ON r.medicine_id = m.medicine_id
        WHERE r.status = 'Pending'`;

      const [results] = await db.query(query);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Pharmacist approves restock request (status update only)
  router.post("/approve-restock", async (req, res) => {
    const { request_id } = req.body;

    try {
      const updateQuery = `UPDATE restock_requests SET status = 'Approved' WHERE request_id = ?`;
      await db.query(updateQuery, [request_id]);

      res.json({ message: "Restock request approved." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get all departments (crashcarts)
  router.get('/departments', (req, res) => {
    const query = "SELECT cart_id AS id, location FROM crashcarts"; // Alias cart_id to crashcart_id
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching departments:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    });
  });
  
  

  // Get full inventory table for admin or analytics
  router.get("/inventory-full", async (req, res) => {
    try {
      const query = `
        SELECT c.name AS crashcart_name, m.name AS medicine_name, a.minimum_quantity, a.current_quantity
        FROM department_medicine_allocation a
        JOIN crashcarts c ON a.crashcart_id = c.crashcart_id
        JOIN medicines m ON a.medicine_id = m.medicine_id
        ORDER BY c.name, m.name`;

      const [results] = await db.query(query);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/cart-id/:location', async (req, res) => {
    const { location } = req.params;
    try {
        const [result] = await db.execute(
            'SELECT cart_id FROM crashcarts WHERE location = ?',
            [location]
        );
        if (result.length > 0) {
            res.json({ cart_id: result[0].cart_id });
        } else {
            res.status(404).json({ error: "Cart not found for this location" });
        }
    } catch (error) {
        res.status(500).json({ error: "Database error", details: error });
    }
});


  return router;
};
