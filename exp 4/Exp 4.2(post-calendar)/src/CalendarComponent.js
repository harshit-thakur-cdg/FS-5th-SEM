import React from "react";

function CalendarComponent({ events, addEvent }) {
  return (
    <div>
      <button onClick={addEvent}>
        Add Sample Event
      </button>

      <h3>Scheduled Events</h3>

      {events.map((event, index) => (
        <p key={index}>
          {event.title}
        </p>
      ))}
    </div>
  );
}

export default React.memo(CalendarComponent);