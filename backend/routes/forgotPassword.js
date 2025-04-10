const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports = function (db) {
  const router = express.Router();

  // Email transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 1️⃣ Forgot Password - Send OTP
  router.post("/forgot-password", (req, res) => {
    const { email } = req.body;
    console.log("📩 Received request at /api/forgot-password");
    console.log("Request Body:", req.body);

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
      if (err) {
        console.error("❌ Database Query Error:", err);
        return res.status(500).json({ message: "Server error", error: err });
      }

      if (user.length === 0) {
        console.warn("⚠️ Email not found:", email);
        return res.status(404).json({ message: "Email not found" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

      db.query("DELETE FROM password_resets WHERE email = ?", [email], (err) => {
        if (err) {
          console.error("❌ Error deleting old OTPs:", err);
          return res.status(500).json({ message: "Server error", error: err });
        }

        db.query(
          "INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)",
          [email, otp, expiresAt],
          (err) => {
            if (err) {
              console.error("❌ Error inserting OTP:", err);
              return res.status(500).json({ message: "Server error", error: err });
            }

            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: email,
              subject: "Your OTP for Password Reset",
              text: `Your OTP is: ${otp}\nThis code will expire in 5 minutes.`,
            };

            transporter.sendMail(mailOptions, (error) => {
              if (error) {
                console.error("❌ Email sending failed:", error);
                return res.status(500).json({ message: "Email sending failed", error });
              }

              console.log("✅ OTP email sent successfully!");
              res.json({ message: "OTP sent to your email" });
            });
          }
        );
      });
    });
  });

  // 2️⃣ Verify OTP
  router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    db.query(
      "SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires_at > NOW()",
      [email, otp],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Server error", error: err });
        if (result.length === 0)
          return res.status(400).json({ message: "Invalid or expired OTP" });

        res.json({ message: "OTP verified" });
      }
    );
  });

  // 3️⃣ Reset Password
  router.post("/reset-password", (req, res) => {
    const { email, otp, newPassword } = req.body;
  
    db.query(
      "SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires_at > NOW()",
      [email, otp],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Server error", error: err });
        if (result.length === 0)
          return res.status(400).json({ message: "Invalid or expired OTP" });
  
        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
          if (err)
            return res.status(500).json({ message: "Hashing error", error: err });
  
          db.query(
            "UPDATE users SET password = ? WHERE email = ?",
            [hashedPassword, email],
            (err) => {
              if (err)
                return res.status(500).json({ message: "Server error", error: err });
  
              db.query("DELETE FROM password_resets WHERE email = ?", [email], (err) => {
                if (err)
                  return res.status(500).json({ message: "Server error", error: err });
  
                res.json({ message: "Password has been reset successfully" });
              });
            }
          );
        });
      }
    );
  });
  return router;
};
