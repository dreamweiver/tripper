import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Trash2 } from "lucide-react";
import { tripDayCount, addDays, daysBetween, type Trip } from "@tripper/shared";
import { Calendar } from "../../components/ui/calendar";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { useTripStore } from "../../stores/tripStore";
import { formatDayLabel } from "./formatDayLabel";
import type { PlannerDay } from "./hooks/usePlannerEvents";

interface EditTripModalProps {
  trip: Trip;
  days: PlannerDay[];
  open: boolean;
  onClose: () => void;
}

// Local YYYY-MM-DD (never toISOString(), which is UTC and can shift the day).
function toLocalIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseLocal(value: string): Date | undefined {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

const placesOnDay = (day: PlannerDay | undefined) =>
  day ? day.events.filter((e) => e.kind === "place").length : 0;

// Trip editor: change the date range (via a range calendar) and delete
// individual days. Deleting or trimming a day that holds real places asks for
// confirmation first; empty days go straight away.
export function EditTripModal({ trip, days, open, onClose }: EditTripModalProps) {
  const setTripDates = useTripStore((s) => s.setTripDates);
  const deleteDay = useTripStore((s) => s.deleteDay);

  const [range, setRange] = useState<DateRange | undefined>(() => ({
    from: parseLocal(trip.startDate),
    to: parseLocal(trip.endDate),
  }));
  // Number of place-stops that a pending action would drop (0 = no warning showing).
  const [datesWarning, setDatesWarning] = useState(0);
  const [confirmDay, setConfirmDay] = useState<number | null>(null);

  // Re-seed local state when the modal opens or the trip's range changes (e.g.
  // after deleting a day, which shrinks the end date). Adjusting state during
  // render — rather than in an effect — is React's recommended way to reset
  // state when a prop changes, and avoids an extra commit.
  const [seed, setSeed] = useState({ start: trip.startDate, end: trip.endDate, open });
  if (seed.start !== trip.startDate || seed.end !== trip.endDate || seed.open !== open) {
    setSeed({ start: trip.startDate, end: trip.endDate, open });
    setRange({ from: parseLocal(trip.startDate), to: parseLocal(trip.endDate) });
    setDatesWarning(0);
    setConfirmDay(null);
  }

  const allEvents = useMemo(() => days.flatMap((d) => d.events), [days]);

  const rangeStart = range?.from ? toLocalIso(range.from) : undefined;
  const rangeEnd = range?.to ? toLocalIso(range.to) : undefined;
  const rangeReady = !!rangeStart && !!rangeEnd;
  const rangeChanged = rangeStart !== trip.startDate || rangeEnd !== trip.endDate;
  const newCount = rangeReady ? tripDayCount(rangeStart!, rangeEnd!) : 0;

  const applyDates = (force: boolean) => {
    if (!rangeReady) return;
    const droppedPlaces = allEvents.filter((e) => {
      if (e.kind !== "place") return false;
      const idx = daysBetween(rangeStart!, addDays(trip.startDate, e.dayIndex));
      return idx < 0 || idx >= newCount;
    }).length;
    if (droppedPlaces > 0 && !force) {
      setDatesWarning(droppedPlaces);
      return;
    }
    setTripDates(trip.id, rangeStart!, rangeEnd!);
    setDatesWarning(0);
  };

  const requestDeleteDay = (dayIndex: number) => {
    if (placesOnDay(days[dayIndex]) > 0) {
      setConfirmDay(dayIndex);
    } else {
      deleteDay(trip.id, dayIndex);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] gap-5 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit trip</DialogTitle>
        </DialogHeader>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">Trip dates</h3>
          <p className="text-xs text-muted-foreground">
            Pick a new start date, then an end date. Growing the trip adds empty days; shrinking it
            removes the days that fall outside the range.
          </p>
          <div className="flex justify-center">
            <Calendar
              mode="range"
              selected={range}
              onSelect={(r) => {
                setRange(r);
                setDatesWarning(0);
              }}
              disabled={{ before: new Date() }}
              aria-label="Trip dates"
            />
          </div>
          {rangeReady && (
            <p className="text-center text-sm font-medium text-teal">
              {newCount} {newCount === 1 ? "day" : "days"} selected
            </p>
          )}
          {datesWarning > 0 && (
            <p
              role="alert"
              className="rounded-md bg-amber-100 px-3 py-2 text-sm font-medium text-amber-800"
            >
              ⚠ This removes {datesWarning} planned {datesWarning === 1 ? "stop" : "stops"}. Save
              anyway?
            </p>
          )}
          <div className="flex justify-end">
            <Button
              className="bg-teal text-teal-foreground hover:bg-teal/90"
              disabled={!rangeReady || !rangeChanged}
              onClick={() => applyDates(datesWarning > 0)}
            >
              {datesWarning > 0 ? "Save anyway" : "Save dates"}
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-2 border-t pt-4">
          <h3 className="text-sm font-semibold text-foreground">Days</h3>
          <ul className="flex flex-col gap-1.5">
            {days.map((day) => {
              const places = placesOnDay(day);
              const confirming = confirmDay === day.dayIndex;
              return (
                <li
                  key={day.dayIndex}
                  className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold">
                      Day {day.dayIndex + 1} — {formatDayLabel(trip.startDate, day.dayIndex)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {places === 0 ? "no stops" : places === 1 ? "1 stop" : `${places} stops`}
                    </span>
                  </div>
                  {confirming ? (
                    <span className="flex flex-none items-center gap-1.5">
                      <span className="text-xs font-semibold text-amber-700">Delete {places}?</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          deleteDay(trip.id, day.dayIndex);
                          setConfirmDay(null);
                        }}
                      >
                        Delete
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setConfirmDay(null)}>
                        Cancel
                      </Button>
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 flex-none text-muted-foreground hover:text-destructive"
                      aria-label={`Delete day ${day.dayIndex + 1}`}
                      disabled={days.length <= 1}
                      onClick={() => requestDeleteDay(day.dayIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </DialogContent>
    </Dialog>
  );
}
