import React from "react";
import "../App.css";

const hours = Array.from({ length: 24 }, (_, i) => i);

const rows = [
  {
    key: "OFF_DUTY",
    label: "Off Duty",
    className: "off-duty",
  },
  {
    key: "SLEEPER",
    label: "Sleeper",
    className: "sleeper",
  },
  {
    key: "DRIVING",
    label: "Driving",
    className: "driving",
  },
  {
    key: "ON_DUTY",
    label: "On Duty",
    className: "on-duty",
  },
];

function getPosition(time) {
  const [hour, minute = 0] = time.split(":").map(Number);

  return ((hour + minute / 60) / 24) * 100;
}

function DailyELDLog({ events = [], day = 1 }) {
  return (
    <div className="daily-eld-container">

      <h2>Daily ELD Log — Day {day}</h2>

      <div className="daily-eld-grid">

        {/* Header */}
        <div className="daily-eld-header">

          <div className="daily-eld-status-title">
            Status
          </div>

          <div className="daily-eld-hours">
            {hours.map((hour) => (
              <div className="daily-eld-hour" key={hour}>
                {hour}
              </div>
            ))}
          </div>

        </div>

        {/* ELD Rows */}
        {rows.map((row) => (

          <div className="daily-eld-row" key={row.key}>

            <div className="daily-eld-status">
              {row.label}
            </div>

            <div className="daily-eld-timeline">

              {/* Vertical hour lines */}
              {hours.map((hour) => (

                <div
                  key={hour}
                  className="daily-eld-grid-line"
                  style={{
                    left: `${(hour / 24) * 100}%`,
                  }}
                />

              ))}

              {/* Events */}
              {events
                .filter(
                  (event) => event.status === row.key
                )
                .map((event, index) => {

                  const start = getPosition(event.start);
                  const end = getPosition(event.end);

                  return (
                    <div
                      key={index}
                      className={`daily-eld-event ${row.className}`}
                      style={{
                        left: `${start}%`,
                        width: `${end - start}%`,
                      }}
                      title={`${event.start} - ${event.end}`}
                    />
                  );

                })}

            </div>

          </div>

        ))}

      </div>

      {/* Time labels */}
      <div className="daily-eld-time-labels">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>

    </div>
  );
}

export default DailyELDLog;