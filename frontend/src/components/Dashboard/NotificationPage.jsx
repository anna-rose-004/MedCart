import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import './Notifications.css';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL_LOCAL ; // Fallback for local development
const socket = io(`${BACKEND_URL}`);

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    socket.on("new-notification", (newNotification) => {
      console.log("📢 Received New Notification:", newNotification);
      setNotifications((prev) => [newNotification, ...prev]); // ✅ Add new notification to the list
    });

    return () => {
      socket.off("new-notification"); //  Cleanup listener on unmount
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const role = localStorage.getItem("role") || "All"; // Get role from storage
      const response = await axios.get(`${BACKEND_URL}/api/notifications?role=${role}`);
      setNotifications(response.data);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/notifications/${id}`);
      setNotifications(notifications.filter((notif) => notif.id !== id));
    } catch (error) {
      console.error("❌ Error dismissing notification:", error);
    }
  };

  const toggleRead = async (id, read) => {
    try {
      await axios.put(`${BACKEND_URL}/api/notifications/read/${id}`, { read_status: !read });
      setNotifications(notifications.map((notif) =>
        notif.id === id ? { ...notif, read: !notif.read } : notif
      ));
    } catch (error) {
      console.error("❌ Error updating notification status:", error);
    }
  };

  return (
    <div className="notifications-container">
      <h2>📋 Crash Cart & Medication Notifications</h2>
      {notifications.length === 0 && <p className="empty-msg">🎉 All caught up! No new notifications.</p>}
      
      {notifications.map((notif) => (
        <div key={notif.id} className={`notification-card ${notif.read ? 'read' : 'unread'}`}>
          <div className="notification-content">
            <h4>{notif.type} 
              <span className={`priority ${notif.priority.toLowerCase()}`}>{notif.priority}</span>
            </h4>
            <p>{notif.message}</p>
          </div>
          <div className="notification-actions">
            <button onClick={() => toggleRead(notif.id)} className="btn-mark">
              {notif.read ? 'Mark as Unread' : 'Mark as Read'}
            </button>
            <button onClick={() => handleDismiss(notif.id)} className="btn-dismiss">Dismiss</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationPage;
