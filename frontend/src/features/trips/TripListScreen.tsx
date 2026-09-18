import { useState } from "react";
import type { TripInput } from "@tripper/shared";
import { useTripStore } from "../../stores/tripStore";
import { Button } from "../../components/ui/button";
import { Logo } from "../../components/Logo";
import { TripList } from "./TripList";
import { CreateTripDialog } from "./CreateTripDialog";
import styles from "./trips.module.scss";

export function TripListScreen() {
  const trips = useTripStore((s) => s.trips);
  const addTrip = useTripStore((s) => s.addTrip);
  const removeTrip = useTripStore((s) => s.removeTrip);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = (input: TripInput) => {
    addTrip(input);
    setDialogOpen(false);
  };

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Logo size={32} />
          <h1 className={styles.heading}>Your trips</h1>
        </div>
        <Button onClick={() => setDialogOpen(true)}>New trip</Button>
      </header>

      <TripList trips={trips} onCreate={() => setDialogOpen(true)} onDelete={removeTrip} />

      <CreateTripDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleSubmit} />
    </main>
  );
}
