import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { tripTitle, tripDayCount, type Trip } from "@tripper/shared";
import { Button } from "../../components/ui/button";
import { formatTripDates } from "./formatTripDates";
import { useDestinationImage } from "./useDestinationImage";
import genericTrip from "../../assets/generic-trip.svg";
import styles from "./TripCard.module.scss";

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
}

export function TripCard({ trip, onDelete }: TripCardProps) {
  const days = tripDayCount(trip.startDate, trip.endDate);
  const image = useDestinationImage(trip);
  const title = tripTitle(trip);

  return (
    <article className={styles.card}>
      <Link to={`/trips/${trip.id}`} className={styles.link}>
        <img
          className={styles.thumb}
          src={image.src}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = genericTrip;
          }}
        />
        <div className={styles.body}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.meta}>{trip.destination}</p>
          <div className={styles.dates}>
            <p className={styles.meta}>{formatTripDates(trip.startDate, trip.endDate)}</p>
            <span className={styles.days}>
              {days} {days === 1 ? "day" : "days"}
            </span>
          </div>
        </div>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Delete ${title}`}
        onClick={() => onDelete(trip.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </article>
  );
}
