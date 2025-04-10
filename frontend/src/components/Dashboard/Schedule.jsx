
import React from "react";
import format from "date-fns/format";

const Schedule = ({ events }) => {
  return (
    <div className="w-1/4 p-4 bg-gray-800 text-white">
      <h2 className="text-lg font-bold mb-4">Schedule</h2>
      <ul>
        {events.map((event, index) => (
          <li key={index} className="mb-2">
            {event.title} - {format(event.start, "Pp")}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Schedule;
