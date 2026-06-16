import { useEffect, useState } from "react";
import { Alarm } from "./components/Alarm";
import { Note } from "./components/Note";
import { Task } from "./components/Task";
import "./index.css";
import type { AlarmItem, Mode, NoteItem, TaskItem } from "./types";

const alarmSound = new Audio("/ochen_gromkij_budilnik.mp3");

function App() {
  const [alarmTime, setAlarmTime] = useState("");
  const [mode, setMode] = useState<Mode>("notes");
  const [title, setTitle] = useState("");
  const [showDoneOnly, setShowDoneOnly] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [task, setTask] = useState("");

  const [list, setList] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem("my_notes");
    return saved ? JSON.parse(saved) : [];
  });

  const [alarmsList, setAlarmsList] = useState<AlarmItem[]>(() => {
    const saved = localStorage.getItem("my_alarms");
    return saved ? JSON.parse(saved) : [];
  });

  const [taskList, setTaskList] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem("my_tasks");
    return saved ? JSON.parse(saved) : [];
  });

  // Сохранение в localStorage
  useEffect(
    () => localStorage.setItem("my_notes", JSON.stringify(list)),
    [list],
  );
  useEffect(
    () => localStorage.setItem("my_alarms", JSON.stringify(alarmsList)),
    [alarmsList],
  );
  useEffect(
    () => localStorage.setItem("my_tasks", JSON.stringify(taskList)),
    [taskList],
  );

  // Оптимизированный таймер + Push-уведомления
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
            alarmSound.play().catch((e) => console.warn("Audio blocked:", e));

            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("⏰ Будильник сработал!", {
                body: alarm.title || "Пора!",
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

  // --- Функции для Заметок ---
  const addNote = () =>
    setList([...list, { id: Date.now(), noteText: "", name: "" }]);
  const deleteNote = (idToRemove: number) =>
    setList(list.filter((item) => item.id !== idToRemove));
  const updateNote = (
    id: number,
    field: "name" | "noteText",
    value: string,
  ) => {
    setList(
      list.map((note) => (note.id === id ? { ...note, [field]: value } : note)),
    );
  };

  // --- Функции для Будильников ---
  const addAlarm = () => {
    if (!alarmTime) return;
    const newAlarm: AlarmItem = {
      idAlarm: Date.now(),
      time: alarmTime,
      title: title || "New Alarm",
      isActive: true,
    };
    setAlarmsList([...alarmsList, newAlarm]);
    setAlarmTime("");
    setTitle("");
  };
  const deleteAlarm = (idToRemove: number) =>
    setAlarmsList(alarmsList.filter((a) => a.idAlarm !== idToRemove));

  // --- Функции для Задач ---
  const addTask = () => {
    setTaskList([
      ...taskList,
      { idTask: Date.now(), task: task || "New Task", isDone: false },
    ]);
    setTask("");
  };
  const deleteTask = (idToRemove: number) =>
    setTaskList(taskList.filter((t) => t.idTask !== idToRemove));
  const toggleTaskDone = (idToToggle: number) => {
    setTaskList(
      taskList.map((t) =>
        t.idTask === idToToggle ? { ...t, isDone: !t.isDone } : t,
      ),
    );
  };

  // Фильтрация
  const filteredList = list.filter((item) =>
    item.name.toLowerCase().includes(searchVal.toLowerCase()),
  );
  const filteredTaskList = taskList.filter((t) =>
    showDoneOnly ? t.isDone : true,
  );

  return (
    <div className="main">
      <div className="nav">
        <button
          className={mode === "notes" ? "active" : ""}
          onClick={() => setMode("notes")}
        >
          Notes
        </button>
        <button
          className={mode === "alarm" ? "active" : ""}
          onClick={() => setMode("alarm")}
        >
          Alarms
        </button>
        <button
          className={mode === "tasks" ? "active" : ""}
          onClick={() => setMode("tasks")}
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
                {...alarm}
                onDeleteAlarm={deleteAlarm}
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
                {...taskItem}
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
