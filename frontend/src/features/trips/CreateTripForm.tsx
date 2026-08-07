import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripInputSchema } from "@tripper/shared";
import type { TripInput } from "@tripper/shared";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface CreateTripFormProps {
  onSubmit: (input: TripInput) => void;
}

// Native date inputs need a min bound so past dates cannot be picked (UI guard; zod is the authoritative gate).
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CreateTripForm({ onSubmit }: CreateTripFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripInput>({ resolver: zodResolver(tripInputSchema) });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit((data) => onSubmit(data))} noValidate>
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
        <Input id="name" placeholder="Auto-named from destination if left blank" {...register("name")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="startDate" className="text-sm font-medium">
          Start date
        </label>
        <Input
          id="startDate"
          type="date"
          min={todayIso()}
          aria-invalid={!!errors.startDate}
          aria-describedby={errors.startDate ? "startDate-error" : undefined}
          {...register("startDate")}
        />
        {errors.startDate && (
          <p id="startDate-error" role="alert" className="text-sm text-destructive">
            {errors.startDate.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="endDate" className="text-sm font-medium">
          End date
        </label>
        <Input
          id="endDate"
          type="date"
          min={todayIso()}
          aria-invalid={!!errors.endDate}
          aria-describedby={errors.endDate ? "endDate-error" : undefined}
          {...register("endDate")}
        />
        {errors.endDate && (
          <p id="endDate-error" role="alert" className="text-sm text-destructive">
            {errors.endDate.message}
          </p>
        )}
      </div>

      <Button type="submit">Start planning</Button>
    </form>
  );
}
