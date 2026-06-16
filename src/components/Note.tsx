import { useState } from "react";
import type { NoteItem } from "../types";

interface NoteProps extends NoteItem {
  onDelete: (id: number) => void;
  onUpdate: (id: number, field: "name" | "noteText", value: string) => void;
}

export const Note = ({ id, name, noteText, onDelete, onUpdate }: NoteProps) => {
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
