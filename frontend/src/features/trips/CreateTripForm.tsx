import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DateRange } from "react-day-picker";
import { tripInputSchema, tripDayCount } from "@tripper/shared";
import type { TripInput } from "@tripper/shared";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Calendar } from "../../components/ui/calendar";

interface CreateTripFormProps {
  onSubmit: (input: TripInput) => void;
}

// Format a Date as a local YYYY-MM-DD (calendar date, no timezone). Never toISOString(),
// which is UTC and can shift the day for users behind/ahead of UTC.
function toLocalIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Parse a YYYY-MM-DD calendar string back to a local Date (for seeding the calendar).
function parseLocal(value: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

export function CreateTripForm({ onSubmit }: CreateTripFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<TripInput>({ resolver: zodResolver(tripInputSchema) });

  // Drive both date fields from one range value; register startDate so its error surfaces.
  const { field: startField } = useController({ name: "startDate", control });
  const { field: endField } = useController({ name: "endDate", control });

  const selected: DateRange | undefined = startField.value
    ? { from: parseLocal(startField.value), to: parseLocal(endField.value) }
    : undefined;

  const handleRangeSelect = (range: DateRange | undefined) => {
    // Picking a start clears any stale end until the user picks the second date.
    setValue("startDate", range?.from ? toLocalIso(range.from) : "", {
      shouldValidate: true,
    });
    setValue("endDate", range?.to ? toLocalIso(range.to) : "", {
      shouldValidate: true,
    });
  };

  const dateError = errors.startDate?.message ?? errors.endDate?.message;

  // Show a live "N days" summary once a full range is selected.
  const dayCount =
    startField.value && endField.value ? tripDayCount(startField.value, endField.value) : undefined;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit((data) => onSubmit(data))}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="destination" className="text-sm font-medium">
          Where to?
        </label>
        <Input
          id="destination"
          placeholder="e.g. Paris, Hawaii, Japan"
          aria-invalid={!!errors.destination}
          aria-describedby={errors.destination ? "destination-error" : undefined}
          {...register("destination")}
        />
        {errors.destination && (
          <p id="destination-error" role="alert" className="text-sm text-destructive">
            {errors.destination.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Trip name (optional)
        </label>
        <Input
          id="name"
          placeholder="Auto-named from destination if left blank"
          {...register("name")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Trip dates</span>
        <p className="text-sm text-muted-foreground">
          Select your start date, then your end date to set the range.
        </p>
        <div className="flex justify-center">
          <Calendar
            mode="range"
            selected={selected}
            onSelect={handleRangeSelect}
            disabled={{ before: new Date() }}
            aria-label="Trip dates"
          />
        </div>
        {dayCount !== undefined && (
          <p className="text-center text-sm font-medium text-teal">
            {dayCount} {dayCount === 1 ? "day" : "days"} selected
          </p>
        )}
        {dateError && (
          <p role="alert" className="text-sm text-destructive">
            {dateError}
          </p>
        )}
      </div>

      <Button type="submit">Start planning</Button>
    </form>
  );
}
