import React, { useState } from "react";
import "./AboutUs.css"; // Assuming your CSS file is in the same directory

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission logic here (API call, etc.)
  };

  return (
    <div>
      <div className="container">
        {/* Contact Icon */}
        <div className="contact-icon">
          <i className="fas fa-phone-alt"></i>
        </div>

        {/* Contact Title */}
        <h3 className="contact-title">Contact Us</h3>

        {/* Contact Description */}
        <p className="contact-description">We are Here to Help You</p>
        <p className="contact-description">
          Our team is always ready to assist you with any inquiries you may have.
        </p>

        {/* Contact Information Section */}
        <div className="contact-details">
          <div className="contact-info">
            <h4>Contact Information</h4>
            <p><strong>Email:</strong> support@medcart.com</p>
            <p><strong>Phone:</strong> +1 800-123-4567</p>
            <p><strong>Address:</strong> 123 Emergency Lane, Medical City, HC 45678</p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="contact-form">
          <form onSubmit={handleSubmit}>
            <h4>How Can We Help You?</h4>
            <div className="form-element">
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-element">
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-element">
              <textarea
                name="message"
                rows="5"
                placeholder="Your Message"
                className="form-control"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-submit">
              <i className="fas fa-arrow-right"></i> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
