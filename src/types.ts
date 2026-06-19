export type Mode = "alarm" | "notes" | "tasks" | "tarot";

export interface TarotCard {
  id: string;
  name: string;
  image: string;
  arcana: string;
  suit: string | null;
}

export interface TaskItem {
  idTask: number;
  task: string;
  isDone: boolean;
}

export interface AlarmItem {
  idAlarm: number;
  time: string;
  title: string;
  isActive: boolean;
}

export interface NoteItem {
  id: number;
  name: string;
  noteText: string;
}
