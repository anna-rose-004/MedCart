import React, { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./LogSign.css";
import ForgotPasswordModal from "./ForgotPasswordModal"; // Import the modal component


const LogSign = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false); 

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/login`, {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role.toLowerCase());
        localStorage.setItem("dept", response.data.dept);
        
        // Decode the token to extract nurse ID
        const decoded = jwtDecode(response.data.token);
        
        
        // Save the nurse ID from the decoded token
        localStorage.setItem("nurse_id", decoded.id);
        if (response.data.crashcart_id !== null && response.data.crashcart_id !== undefined) {
          localStorage.setItem("crashcart_id", response.data.crashcart_id);
          console.log("Stored Crashcart ID:", response.data.crashcart_id);
        } else {
          console.warn("No crashcart_id found in response.");
        }
        window.history.pushState({}, "", window.location.href);
        
        if (response.data.role.toLowerCase() === "admin") {
          navigate("/admin-dashboard");
        } else if (response.data.role.toLowerCase() === "pharmacist") {
          navigate("/pharmacist");
        } else {
          navigate("/dashboard");
        }
      } else {
        console.error("Login failed response:", response.data);
        setError("Invalid email or password");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className={`container ${isForgotPasswordOpen ? "hidden" : ""}`}>
      {!isForgotPasswordOpen && (
      <div className="screen">
        <div className="screen__content">
          <form className="login" onSubmit={handleLogin}>
            <div className="login__field">
              <i className="login__icon fas fa-user"></i>
              <input
                type="text"
                className="login__input"
                name="email"
                placeholder="User name / Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="login__field">
              <i className="login__icon fas fa-lock"></i>
              <input
                type="password"
                className="login__input"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error">{error}</p>}
            <div className="button-container">
              <button className="button login__submit">
                <span className="button__text">Log In Now</span>
                <i className="button__icon fas fa-chevron-right"></i>
              </button>
              <p className="forgot">
                <span
                  className="forgot-link"
                  onClick={() => setIsForgotPasswordOpen(true)} // Open the modal
                >
                  Forgot password?
                </span>
              </p>
            </div>
          </form>
        </div>
        <div className="screen__background">
          <span className="screen__background__shape screen__background__shape4"></span>
          <span className="screen__background__shape screen__background__shape3"></span>
          <span className="screen__background__shape screen__background__shape2"></span>
          <span className="screen__background__shape screen__background__shape1"></span>
        </div>
      </div>
      )}
      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)} // Close the modal
        />
      )}
    </div>
  );
};

export default LogSign;
