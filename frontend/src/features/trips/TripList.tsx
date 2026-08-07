import type { Trip } from "@tripper/shared";
import { EmptyState } from "./EmptyState";
import { TripCard } from "./TripCard";

interface TripListProps {
  trips: Trip[];
  onCreate?: () => void;
  onDelete: (id: string) => void;
}

export function TripList({ trips, onCreate, onDelete }: TripListProps) {
  if (trips.length === 0) {
    return <EmptyState onCreate={onCreate} />;
  }
  return (
    <div className="flex flex-col gap-3">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} onDelete={onDelete} />
      ))}
    </div>
  );
}
