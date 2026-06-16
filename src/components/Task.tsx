import type { TaskItem } from "../types";

interface TaskProps extends TaskItem {
  onDeleteTask: (idTask: number) => void;
  onToggleDone: (idTask: number) => void;
}

export const Task = ({
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
