import { Trash2 } from "lucide-react";
import { tripTitle, type Trip } from "@tripper/shared";
import { Button } from "../../components/ui/button";
import { formatTripDates } from "./formatTripDates";
import styles from "./TripCard.module.scss";

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
}

export function TripCard({ trip, onDelete }: TripCardProps) {
  return (
    <article className={styles.card}>
      <div>
        <h2 className={styles.title}>{tripTitle(trip)}</h2>
        <p className={styles.meta}>{trip.destination}</p>
        <p className={styles.meta}>{formatTripDates(trip.startDate, trip.endDate)}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Delete ${tripTitle(trip)}`}
        onClick={() => onDelete(trip.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </article>
  );
}
