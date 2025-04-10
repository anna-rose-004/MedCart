import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Dashboard = () => (
  <div className="p-4">
    <h2 className="text-xl font-bold">Dashboard</h2>
    <p>Welcome to the dashboard! Add content here.</p>
  </div>
);

const Schedule = ({ events }) => (
  <div className="p-4 w-full">
    <h2 className="text-xl font-bold mb-4">Schedule</h2>
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
    />
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [events, setEvents] = useState([
    {
      title: "Meeting",
      start: new Date(),
      end: new Date(),
    },
  ]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 h-screen bg-purple-300 p-5">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`block w-full mb-3 p-2 rounded ${
            activeTab === "dashboard" ? "bg-purple-500 text-white" : "bg-white"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`block w-full p-2 rounded ${
            activeTab === "schedule" ? "bg-purple-500 text-white" : "bg-white"
          }`}
        >
          Schedule
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-5">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "schedule" && <Schedule events={events} />}
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

export default App;
