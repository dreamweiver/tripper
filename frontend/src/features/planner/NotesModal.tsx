import { useState } from "react";

interface NotesModalProps {
  title: string;
  notes: string[];
  open: boolean;
  onSave: (notes: string[]) => void;
  onClose: () => void;
}

export function NotesModal({ title, notes, open, onSave, onClose }: NotesModalProps) {
  const [draft, setDraft] = useState(notes.join("\n"));
  if (!open) return null;
  const handleSave = () => {
    const next = draft
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    onSave(next);
  };
  return (
    <div role="dialog" aria-label={`${title} — Notes`}>
      <ul>
        {notes.map((note, i) => (
          <li key={i}>{note}</li>
        ))}
      </ul>
      <textarea aria-label="Edit notes" value={draft} onChange={(e) => setDraft(e.target.value)} />
      <button type="button" onClick={handleSave}>
        Save
      </button>
      <button type="button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
