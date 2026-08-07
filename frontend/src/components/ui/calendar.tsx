import { DayPicker, type DayPickerProps } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

// Wraps react-day-picker with our design tokens. Range endpoints render solid teal,
// the middle span light teal, and past dates are greyed out via the `disabled` prop.
export type CalendarProps = DayPickerProps;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("select-none", className)}
      classNames={{
        months: "relative",
        month: "space-y-3",
        month_caption: "flex h-9 items-center justify-center text-sm font-medium",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between px-1",
        button_previous:
          "inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-secondary disabled:opacity-40",
        button_next:
          "inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-secondary disabled:opacity-40",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-xs font-normal text-muted-foreground",
        week: "flex w-full",
        day: "h-9 w-9 p-0 text-center text-sm",
        day_button:
          "inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-secondary aria-selected:opacity-100",
        today: "font-semibold text-teal",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-40 pointer-events-none",
        range_start:
          "rounded-l-md [&>button]:bg-teal [&>button]:text-teal-foreground [&>button:hover]:bg-teal",
        range_end:
          "rounded-r-md [&>button]:bg-teal [&>button]:text-teal-foreground [&>button:hover]:bg-teal",
        range_middle: "bg-teal-muted [&>button]:bg-transparent [&>button:hover]:bg-teal-muted",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}
