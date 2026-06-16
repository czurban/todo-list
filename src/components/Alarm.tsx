import type { AlarmItem } from "../types";

interface AlarmComponentProps extends AlarmItem {
  onDeleteAlarm: (idAlarm: number) => void;
}

export const Alarm = ({
  time,
  title,
  idAlarm,
  onDeleteAlarm,
}: AlarmComponentProps) => {
  return (
    <div className="alarm">
      <button onClick={() => onDeleteAlarm(idAlarm)} className="deleteAlarmBtn">
        ✕
      </button>
      <h3>{title}</h3>
      <p>{time}</p>
    </div>
  );
};
