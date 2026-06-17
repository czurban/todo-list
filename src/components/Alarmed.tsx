import type { AlarmItem } from "../types";

interface AlarmedProps {
  alarm: AlarmItem;
  stopAlarm: () => void;
}

export const Alarmed = ({ alarm, stopAlarm }: AlarmedProps) => {
  return (
    <div className="alarmed-overlay">
      <div className="alarmed">
        <div className="alarmed-content">
          <h3>{alarm.title || "Alarm!"}</h3>
          <p>{alarm.time}</p>
        </div>
        <button className="stopBtn" onClick={stopAlarm}>
          STOP
        </button>
      </div>
    </div>
  );
};
