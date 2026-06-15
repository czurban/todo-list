import { useEffect, useState } from "react";
import "./index.css";

type Mode = "alarm" | "notes" | "tasks";
const alarmSound = new Audio("/ochen_gromkij_budilnik.mp3");

interface Task {
  idTask: number;
  task: string;
  isDone: boolean;
}

interface AlarmProps {
  idAlarm: number;
  time: string;
  title: string;
  isActive: boolean;
}

interface NoteType {
  id: number;
  name: string;
  noteText: string;
}

interface AlarmComponentProps extends AlarmProps {
  onDeleteAlarm: (idAlarm: number) => void;
}

interface TaskProps extends Task {
  onDeleteTask: (idTask: number) => void;
  onToggleDone: (idTask: number) => void;
}

interface NoteProps extends NoteType {
  onDelete: (id: number) => void;
  onUpdate: (id: number, field: "name" | "noteText", value: string) => void;
}

const Task = ({
  task,
  idTask,
  isDone,
  onDeleteTask,
  onToggleDone,
}: TaskProps) => {
  return (
    <div className={`task ${isDone ? "done" : ""}`}>
      <p>{task}</p>

      <div className="taskActions">
        <button className="deleteTaskBtn" onClick={() => onDeleteTask(idTask)}>
          ✕
        </button>
        <input
          type="checkbox"
          checked={isDone}
          onChange={() => onToggleDone(idTask)}
        />
      </div>
    </div>
  );
};

const Alarm = ({
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

const Note = ({ id, name, noteText, onDelete, onUpdate }: NoteProps) => {
  const [isChanging, setIsChanging] = useState(false);

  return (
    <div className="note">
      <div className="topNote">
        <button onClick={() => onDelete(id)} className="b1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {isChanging ? (
          <input
            className="input1"
            value={name}
            placeholder="Name"
            onChange={(e) => onUpdate(id, "name", e.target.value)}
          />
        ) : (
          <p className="input1text">
            {name ? name.toLocaleUpperCase() : "Empty"}
          </p>
        )}
      </div>

      {isChanging ? (
        <textarea
          className="input2"
          value={noteText}
          placeholder="Note text..."
          onChange={(e) => onUpdate(id, "noteText", e.target.value)}
        />
      ) : (
        <p className="input2text">{noteText}</p>
      )}

      <button onClick={() => setIsChanging(!isChanging)} className="b2">
        {isChanging ? "Confirm" : "Change"}
      </button>
    </div>
  );
};

function App() {
  const [alarmTime, setAlarmTime] = useState("");
  const [mode, setMode] = useState<Mode>("notes");
  const [title, setTitle] = useState("");
  const [showDoneOnly, setShowDoneOnly] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [task, setTask] = useState("");

  const [list, setList] = useState<NoteType[]>(() => {
    const saved = localStorage.getItem("my_notes");
    return saved ? JSON.parse(saved) : [];
  });

  const [alarmsList, setAlarmsList] = useState<AlarmProps[]>(() => {
    const saved = localStorage.getItem("my_alarms");
    return saved ? JSON.parse(saved) : [];
  });

  const [taskList, setTaskList] = useState<Task[]>(() => {
    const saved = localStorage.getItem("my_tasks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("my_notes", JSON.stringify(list));
  }, [list]);

  useEffect(() => {
    localStorage.setItem("my_alarms", JSON.stringify(alarmsList));
  }, [alarmsList]);

  useEffect(() => {
    localStorage.setItem("my_tasks", JSON.stringify(taskList));
  }, [taskList]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const timer = setInterval(() => {
      const now = new Date();
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentTimeString = `${currentHours}:${currentMinutes}`;

      setAlarmsList((prevList) => {
        let isChanged = false;

        const newList = prevList.map((alarm) => {
          if (alarm.time === currentTimeString && alarm.isActive) {
            isChanged = true;

            alarmSound
              .play()
              .catch((e) => console.warn("browser blocked the sound", e));

            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("ALARM ALARM!!", {
                body: alarm.title,
                icon: "https://cdn-icons-png.flaticon.com/512/833/833604.png",
              });
            }

            return { ...alarm, isActive: false };
          }
          return alarm;
        });

        return isChanged ? newList : prevList;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const addNote = () => {
    setList([...list, { id: Date.now(), noteText: "", name: "" }]);
  };

  const deleteNote = (idToRemove: number) => {
    setList(list.filter((item) => item.id !== idToRemove));
  };

  const updateNote = (
    id: number,
    field: "name" | "noteText",
    value: string,
  ) => {
    setList(
      list.map((note) => (note.id === id ? { ...note, [field]: value } : note)),
    );
  };

  const toggleTaskDone = (idToToggle: number) => {
    setTaskList(
      taskList.map((t) =>
        t.idTask === idToToggle ? { ...t, isDone: !t.isDone } : t,
      ),
    );
  };

  const deleteAlarm = (idToRemoveAlarm: number) => {
    setAlarmsList(
      alarmsList.filter((alarm) => alarm.idAlarm !== idToRemoveAlarm),
    );
  };

  const deleteTask = (idToRemoveTask: number) => {
    setTaskList(taskList.filter((task) => task.idTask !== idToRemoveTask));
  };

  function ChangeToNote() {
    setMode("notes");
  }

  function ChangeToAlarm() {
    setMode("alarm");
  }

  function ChangeToTask() {
    setMode("tasks");
  }

  function addAlarm() {
    if (!alarmTime) return;

    const newAlarm: AlarmProps = {
      idAlarm: Date.now(),
      time: alarmTime,
      title: title || "New Alarm",
      isActive: true,
    };

    setAlarmsList([...alarmsList, newAlarm]);
    setAlarmTime("");
    setTitle("");
  }

  function addTask() {
    const newTask: Task = {
      idTask: Date.now(),
      task: task || "New Task",
      isDone: false,
    };

    setTaskList([...taskList, newTask]);
    setTask("");
  }

  const filteredList = list.filter((item) =>
    item.name.toLowerCase().includes(searchVal.toLowerCase()),
  );

  const filteredTaskList = taskList.filter((taskItem) => {
    if (showDoneOnly) {
      return taskItem.isDone === true;
    }
    return true;
  });

  return (
    <div className="main">
      <div className="nav">
        <button
          className={mode === "notes" ? "active" : ""}
          onClick={ChangeToNote}
        >
          Notes
        </button>
        <button
          className={mode === "alarm" ? "active" : ""}
          onClick={ChangeToAlarm}
        >
          Alarms
        </button>
        <button
          className={mode === "tasks" ? "active" : ""}
          onClick={ChangeToTask}
        >
          Tasks
        </button>
      </div>

      {mode === "notes" && (
        <>
          <h2 className="title">My Notes</h2>
          <div className="searchNote">
            <input
              className="searchInput"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search Note..."
            />
          </div>
          <div className="list">
            {filteredList.map((item) => (
              <Note
                key={item.id}
                {...item}
                onDelete={deleteNote}
                onUpdate={updateNote}
              />
            ))}
            <div className="buttonPlace">
              <button type="button" onClick={addNote} className="addButton">
                +
              </button>
            </div>
          </div>
        </>
      )}

      {mode === "alarm" && (
        <>
          <h2 className="title">My Alarms</h2>
          <div className="alarmControls">
            <input
              type="text"
              placeholder="Alarm title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="time"
              value={alarmTime}
              onChange={(e) => setAlarmTime(e.target.value)}
            />
            <button onClick={addAlarm}>Add Alarm</button>
          </div>
          <div className="alarmList">
            {alarmsList.map((alarm) => (
              <Alarm
                key={alarm.idAlarm}
                time={alarm.time}
                title={alarm.title}
                onDeleteAlarm={deleteAlarm}
                idAlarm={alarm.idAlarm}
                isActive={alarm.isActive}
              />
            ))}
          </div>
        </>
      )}
      {mode === "tasks" && (
        <>
          <h2 className="title">My Tasks</h2>
          <div className="taskControls">
            <input
              type="text"
              placeholder="Type your task..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
            <button onClick={addTask}>Add Task</button>
          </div>

          <div className="taskFilter">
            <label>
              <input
                type="checkbox"
                checked={showDoneOnly}
                onChange={() => setShowDoneOnly(!showDoneOnly)}
              />
              <span>Show completed only</span>
            </label>
          </div>

          <div className="taskList">
            {filteredTaskList.map((taskItem) => (
              <Task
                key={taskItem.idTask}
                idTask={taskItem.idTask}
                task={taskItem.task}
                isDone={taskItem.isDone}
                onDeleteTask={deleteTask}
                onToggleDone={toggleTaskDone}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
