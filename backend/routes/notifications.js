const express = require("express");
const cron = require("node-cron"); //  Import node-cron

module.exports = (db, io) => {
  const router = express.Router();

  // Fetch notifications for a specific role
  router.get("/", (req, res) => {
    const { role } = req.query;
    let sql = "SELECT * FROM notifications WHERE recipient_role = 'All' OR recipient_role = ? AND read_status = 0";
    
    db.query(sql, [role], (err, results) => {
      if (err) {
        console.error("❌ Database Error:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  });

  // ✅ Mark a notification as read/unread
  router.put("/read/:id", (req, res) => {
    const { id } = req.params;
    const { read_status } = req.body;

    let sql = "UPDATE notifications SET read_status = ? WHERE id = ?";
    
    db.query(sql, [read_status, id], (err, result) => {
      if (err) {
        console.error("❌ Database Update Error:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: "Notification status updated." });
    });
  });

  // ✅ Delete a notification
  router.delete("/:id", (req, res) => {
    const { id } = req.params;
    let sql = "DELETE FROM notifications WHERE id = ?";
    
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error("❌ Database Delete Error:", err.message);
        return res.status(500).json({ error: err.message });
      }

      // ✅ Broadcast notification deletion
      io.emit("notification-deleted", { id });

      res.json({ success: true, message: "Notification deleted." });
    });
  });

  // ✅ Create a new notification & send it in real-time
  router.post("/", (req, res) => {
    const { type, message, priority, recipient_role } = req.body;

    let sql = `INSERT INTO notifications (type, message, priority, recipient_role) VALUES (?, ?, ?, ?)`;
    
    db.query(sql, [type, message, priority, recipient_role], (err, result) => {
      if (err) {
        console.error("❌ Database Insert Error:", err.message);
        return res.status(500).json({ error: err.message });
      }

      const newNotification = {
        id: result.insertId,
        type,
        message,
        priority,
        recipient_role,
        read_status: false,
        created_at: new Date(),
      };

      console.log("📢 Sending Real-Time Notification:", newNotification);
      io.emit("new-notification", newNotification); // ✅ Broadcast to all connected clients

      res.json({ success: true, notification: newNotification });
    });
  });

  //  Automated System Alerts (Run every 1 hour)
  cron.schedule("0 * * * *", async () => {
    console.log("🔄 Running system checks for expired & low-stock medicines...");
    checkForSystemAlerts();
  });

  //  Function to check expired medicines & low stock
  function checkForSystemAlerts() {
    //  Fetch expired medicines
    db.query(
      "SELECT name, batch_id, expiry_date FROM batches WHERE expiry_date < CURDATE()",
      (err, expiredMeds) => {
        if (err) {
          console.error("❌ Error fetching expired medicines:", err.message);
          return;
        }

        expiredMeds.forEach((med) => {
          const message = `Medicine ${med.name} (Batch ${med.batch_id}) expired on ${med.expiry_date}`;
          sendNotification("Expired Medication Alert", message, "High", "Pharmacist");
        });
      }
    );

    //  Fetch low-stock medicines (less than 5 units)
    db.query(
      "SELECT name, batch_id, total_units FROM batches WHERE total_units < 5",
      (err, lowStockMeds) => {
        if (err) {
          console.error("❌ Error fetching low-stock medicines:", err.message);
          return;
        }

        lowStockMeds.forEach((med) => {
          const message = `Low stock: Only ${med.total_units} units left for ${med.name} (Batch ${med.batch_id})`;
          sendNotification("Low Stock Alert", message, "Medium", "Pharmacist");
        });
      }
    );

     // Check for medicines below minimum quantity per crashcart
      const lowStockSql = `
      SELECT 
        dma.crashcart_id,
        c.location AS crashcart_location,
        dma.medicine_id,
        m.name AS medicine_name,
        dma.minimum_quantity,
        COUNT(
          CASE 
            WHEN um.unit_id IS NOT NULL AND um.dispensed = 0 AND b.expiry_date >= CURDATE()
            THEN um.unit_id 
            ELSE NULL 
          END
        ) AS current_quantity
      FROM department_medicine_allocation dma
      JOIN crashcarts c ON c.cart_id = dma.crashcart_id
      JOIN medicines m ON m.medicine_id = dma.medicine_id
      LEFT JOIN unit_medicine um ON um.name = m.name AND um.crashcart_id = dma.crashcart_id
      LEFT JOIN batches b ON b.batch_number = um.batch_id
      GROUP BY dma.crashcart_id, dma.medicine_id, dma.minimum_quantity
      `;

      db.query(lowStockSql, (err, rows) => {
      if (err) {
        console.error("❌ Error checking crashcart stock:", err.message);
        return;
      }

      rows.forEach(row => {
        console.log(`🧾 Checking: ${row.medicine_name} in ${row.crashcart_location}`);
        console.log(`➡️ Minimum: ${row.minimum_quantity}, Current: ${row.current_quantity}`);
      
        if (row.current_quantity < row.minimum_quantity) {
          const message = `Crashcart ${row.crashcart_location}: Medicine ${row.medicine_name} is below minimum stock. Minimum: ${row.minimum_quantity}, Current: ${row.current_quantity}`;
          sendNotification("Crashcart Low Stock", message, "High", "Pharmacist");
        } else {
          console.log("✅ Stock is sufficient, no alert needed.");
        }
      });
      });

  }

  //  Function to insert notifications into DB and send via WebSocket
  function sendNotification(type, message, priority, recipient_role) {
    const checkSql = `SELECT id FROM notifications WHERE message = ? AND recipient_role = ?`;
  
    db.query(checkSql, [message, recipient_role], (err, rows) => {
      if (err) {
        console.error("❌ Error checking for existing notification:", err.message);
        return;
      }
  
      if (rows.length > 0) {
        console.log("🔁 Duplicate notification skipped:", message);
        return; // Already sent, skip it
      }
  
      const insertSql = `INSERT INTO notifications (type, message, priority, recipient_role) VALUES (?, ?, ?, ?)`;
  
      db.query(insertSql, [type, message, priority, recipient_role], (err, result) => {
        if (err) {
          console.error("❌ Error inserting system notification:", err.message);
          return;
        }
  
        const newNotification = {
          id: result.insertId,
          type,
          message,
          priority,
          recipient_role,
          read_status: false,
          created_at: new Date(),
        };
  
        console.log("📢 System Notification Sent:", newNotification);
        io.emit("new-notification", newNotification);
      });
    });
  }
  

  router.get("/unread-count", (req, res) => {
    const sql = "SELECT COUNT(*) AS unreadCount FROM notifications WHERE read_status = 0";
    
    db.query(sql, (err, results) => {
      if (err) {
        console.error("❌ Database Error:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(results[0]);
    });
  });

    //view profile section
  // Get nurse profile by ID
  router.get("/users/profile/:id", (req, res) => {
    const { id } = req.params;
  
    const sql = "SELECT * FROM users WHERE user_id = ?";
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error("❌ Error fetching user profile:", err.message);
        return res.status(500).json({ message: "Server error" });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({ profile: results[0] });
    });
  });
  
  // Update nurse basic details
  router.put("/users/update-basic-details/:id", (req, res) => {
    const { id } = req.params;
    const {
      house_name, city, district, state,
      pincode, phone, birth_date, experience_years,
    } = req.body;
  
    const sql = `UPDATE users SET house_name = ?, city = ?, district = ?, state = ?, pincode = ?, phone = ?, birth_date = ?, experience_years = ? WHERE user_id = ?`;
  
    const values = [
      house_name, city, district, state,
      pincode, phone, birth_date, experience_years, id,
    ];
  
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("❌ Error updating profile:", err.message);
        return res.status(500).json({ message: "Server error", error: err.message });
      }
  
      if (result.affectedRows > 0) {
        console.log(`✅ User ${id} profile updated`);
        res.json({ message: "Profile updated successfully" });
      } else {
        console.warn(`⚠️ No rows updated for user ${id}`);
        res.status(400).json({ message: "Failed to update profile" });
      }
    });
  });
  

    return router;
  };
  



