const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key"; // Ensure this matches your server.js secret

module.exports = (db) => {
  const router = express.Router();

  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    const query = `
      SELECT u.user_id, u.email, u.password, u.role, u.dept, c.cart_id
      FROM users u
      LEFT JOIN crashcarts c ON u.dept = c.location
      WHERE u.email = ?`;
  
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error("❌ Database Error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }
  
      console.log("🔍 Query Results:", results); // Debugging log
  
      if (results.length === 0) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }
  
      const user = results[0];
  
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }
      console.log(" Assigned Crashcart ID:", user.cart_id); // Debugging log
  
      const token = jwt.sign(
        {
          id: user.user_id,
          email: user.email,
          role: user.role,
          dept: user.dept,
          crashcart_id: user.cart_id || null, // Ensure null if not assigned
        },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
  
      res.json({
        success: true,
        token,
        id: user.user_id,
        role: user.role,
        dept: user.dept,
        crashcart_id: user.cart_id || null,
      });
    });
  });

  
  

  return router;
};
