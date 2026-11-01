import React, {
  useState,
  useMemo,
  useCallback,
  useEffect
} from "react";

import "./App.css";

function App() {

  const [events, setEvents] = useState([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);

  }, []);

  const addEvent = useCallback(() => {

    const title = prompt("Enter Event Name");

    if(title){

      setEvents(prev => [
        ...prev,
        { title }
      ]);

    }

  }, []);

  const deleteEvent = useCallback((index) => {

    if(window.confirm("Delete this event?")){

      setEvents(prev =>
        prev.filter((_, i) => i !== index)
      );

    }

  }, []);

  const totalEvents = useMemo(() => {
    return events.length;
  }, [events]);

  const badge = useMemo(() => {

    if(events.length >= 10)
      return "🥇 Pro Scheduler";

    if(events.length >= 5)
      return "🥈 Intermediate Planner";

    return "🥉 Beginner Scheduler";

  }, [events]);

  const colors = [
    "#E3F2FD",
    "#F3E5F5",
    "#E8F5E9",
    "#FFF3E0",
    "#FCE4EC"
  ];

  return (
    <div className="container">

      <div className="card">

        <h1>
          🚀 Social Media Scheduler
        </h1>

        <p className="clock">
          {time.toLocaleString()}
        </p>

        <div className="stats">

          <div className="stat-box">
            <h2>{totalEvents}</h2>
            <p>Total Events</p>
          </div>

          <div className="stat-box">
            <h2>{badge}</h2>
            <p>Achievement</p>
          </div>

        </div>

        <button
          className="add-btn"
          onClick={addEvent}
        >
          ➕ Add Event
        </button>

        <h2 className="title">
          Scheduled Events
        </h2>

        {events.length === 0 ? (

          <p className="empty">
            No Events Scheduled
          </p>

        ) : (

          events.map((event, index) => (

            <div
              key={index}
              className="event-card"
              style={{
                background:
                colors[index % colors.length]
              }}
            >

              <span>
                📌 {event.title}
              </span>

              <button
                className="delete-btn"
                onClick={() =>
                  deleteEvent(index)
                }
              >
                ❌
              </button>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default App;