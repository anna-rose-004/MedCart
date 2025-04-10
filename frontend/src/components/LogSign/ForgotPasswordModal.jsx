import React, { useState } from "react";
import axios from "axios";
import "./LogSign.css"; // Import styles

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP, 3 = new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOtp = async () => {
    try {
      console.log("Sending OTP to:", email); // Debugging log
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/forgot-password1`, { email });
      console.log("Response:", res.data); // Check response
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Error sending OTP");
    }
  };
  

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/verify-otp`, {
        email,
        otp,
      });
      setMessage(res.data.message);
      setStep(3); // keep otp state intact for use in handleResetPassword
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid OTP");
    }
  };
  

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
  
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/reset-password`, {
        email,
        otp, // this must still be in state
        newPassword,
      });
  
      setMessage(res.data.message);
      setTimeout(() => {
        onClose();
        setStep(1);
        setEmail("");
        setOtp(""); // it's okay to clear here, AFTER successful reset
        setNewPassword("");
        setConfirmPassword("");
        setMessage("");
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error resetting password");
    }
  };  
  
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <button onClick={onClose} className="modal-close">&times;</button>

        {step === 1 && (
          <>
            <h2 className="modal-header">Forgot Password</h2>
            <input
              type="email"
              placeholder="Enter your email"
              className="modal-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleSendOtp} className="modal-button blue">
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="modal-header">Enter OTP</h2>
            <input
              type="text"
              placeholder="Enter OTP sent to your email"
              className="modal-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={handleVerifyOtp} className="modal-button green">
              Verify OTP
            </button>
            <button onclick={handleSendOtp} className="modal-button blue">
              Resend OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="modal-header">Reset Password</h2>
            <input
              type="password"
              placeholder="New Password"
              className="modal-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="modal-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={handleResetPassword} className="modal-button purple">
              Reset Password
            </button>
          </>
        )}

        {message && <p className="modal-message">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
