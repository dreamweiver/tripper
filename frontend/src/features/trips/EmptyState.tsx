import { Button } from "../../components/ui/button";

interface EmptyStateProps {
  onCreate: () => void;
}

export function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-muted-foreground">No trips yet — start planning your first one.</p>
      <Button onClick={onCreate}>New trip</Button>
    </div>
  );
}
