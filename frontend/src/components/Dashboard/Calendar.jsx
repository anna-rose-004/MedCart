import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Calendar.css";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL_LOCAL;


const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [eventInput, setEventInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const today = new Date();

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    const userId = localStorage.getItem("nurse_id");
    console.log("Fetching events for nurse_id:", userId);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/events?user_id=${userId}`);
  
      const grouped = {};
      const flatList = [];
  
      response.data.forEach((event) => {
        const eventDate = new Date(event.date);
        const dateKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, "0")}-${String(eventDate.getDate()).padStart(2, "0")}`;
  
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push({ id: event.id, name: event.event });
  
        // Push to flat list
        flatList.push({
          id: event.id,
          name: event.event,
          date: eventDate,
        });
      });
  
      // Sort flat list by date
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
  
      const upcoming = flatList.filter((event) => event.date >= todayStart);
      upcoming.sort((a, b) => a.date - b.date);
  
      setEvents(grouped);
      setUpcomingEvents(upcoming);
  
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const getMonthName = (date) => date.toLocaleString("default", { month: "long" });
  const getYear = (date) => date.getFullYear();

  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const openModal = (day) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    
    setSelectedDay(dateKey);
    setEventInput("");
    setShowModal(true);
  };

  const handleSaveEvent = async () => {
    const userId = localStorage.getItem("nurse_id");
    if (!userId || !eventInput.trim()) return;
  
    console.log("Saving event for user:", userId);
  
    try {
      // Save the event to the backend
      const response = await axios.post(`${BACKEND_URL}/api/events`, {
        date: selectedDay, // Use the full date key (YYYY-MM-DD)
        event: eventInput.trim(),
        user_id: userId,
      });
  
      const newEvent = {
        id: response.data.id, // Use the ID returned from the backend
        name: eventInput.trim(),
      };
  
      // Update the events state for the selected day
      setEvents((prev) => {
        const updated = { ...prev };
        if (!updated[selectedDay]) {
          updated[selectedDay] = [];
        }
        updated[selectedDay] = [...updated[selectedDay], newEvent]; // Append the new event
        return updated;
      });
  
      // Clear the input but keep the modal open
      setEventInput("");
  
      // Refresh upcoming events
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

    const handleDelete = async (eventId) => {
      try {
        await axios.delete(`${BACKEND_URL}/api/events/${eventId}`);
        fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
      }
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth}>&lt;</button>
        <h2>{`${getMonthName(currentDate)} ${getYear(currentDate)}`}</h2>
        <button onClick={nextMonth}>&gt;</button>
      </div>

      <div className="calendar-grid-header">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="calendar-day header">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {Array(firstDay).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day empty" />
        ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday =
            day === new Date().getDate() &&
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear();
          const hasEvents = events[dateKey] && events[dateKey].length > 0;

          return (
            <div
              key={day}
              className={`calendar-day ${isToday ? "today" : ""}`}
              style={isToday ? { border: "2px solid red" } : {}}
              onClick={() => openModal(day)}
            >
              {day}
              {hasEvents && <span className="event-dot"></span>}
            </div>
          );
        })}
      </div>

      {showModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">Events on {selectedDay}</div>

      {events[selectedDay] && events[selectedDay].length > 0 ? (
        <ul>
          {events[selectedDay].map((ev) => (
            <li key={ev.id}>
              {ev.name}
              <button
                onClick={() => handleDelete(ev.id)}
                style={{
                  float: "right",
                  background: "#d50000",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  padding: "2px 6px",
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-event-msg">No events yet.</p>
      )}

      {/* Allow adding new events only for future dates */}
      {new Date(selectedDay) >= new Date().setHours(0, 0, 0, 0) && (
        <>
          <input
            type="text"
            className="event-input"
            value={eventInput}
            onChange={(e) => setEventInput(e.target.value)}
            placeholder="Enter new event..."
          />
          <button className="add-btn" onClick={handleSaveEvent}>
            Add Event
          </button>
        </>
      )}

    <button className="modal-close" onClick={() => setShowModal(false)}>
      &times;
    </button>
    </div>
  </div>
)}

      {upcomingEvents.length > 0 && (
        <div className="upcoming-events">
          <h3>🗓️ Upcoming Events:</h3>
          <ul>
            {upcomingEvents.map((ev) => (
              <li key={ev.id}>
                {ev.date.toLocaleDateString("default", { month: "short", day: "numeric" })} — {ev.name}
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};

export default Calendar;
