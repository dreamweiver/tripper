interface NotesListProps {
  notes: string[];
  maxVisible?: number;
  onExpand: () => void;
}

export function NotesList({ notes, maxVisible = 3, onExpand }: NotesListProps) {
  if (notes.length === 0) return null;
  const visible = notes.slice(0, maxVisible);
  const hiddenCount = notes.length - visible.length;
  return (
    <div>
      <ul>
        {visible.map((note, i) => (
          <li key={i}>{note}</li>
        ))}
      </ul>
      {hiddenCount > 0 && (
        <button type="button" onClick={onExpand}>
          +{hiddenCount} more notes
        </button>
      )}
    </div>
  );
}
