import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./App.css";

function App() {
  const [events, setEvents] = useState([]);

  const handleDateClick = (info) => {
    const title = prompt("Enter Post Title");

    if (title) {
      setEvents([
        ...events,
        {
          title,
          date: info.dateStr,
        },
      ]);
    }
  };

  return (
    <div className="container">

      <div className="header">
        <h1>📅 Social Media Scheduler</h1>
        <p>Plan • Schedule • Publish</p>
      </div>

      <div className="calendar-box">

        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
          ]}
          initialView="dayGridMonth"
          selectable={true}
          editable={true}
          events={events}
          dateClick={handleDateClick}
          height="800px"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
        />

      </div>

    </div>
  );
}

export default App;