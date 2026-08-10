import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventCard } from "./EventCard";
import type { DecoratedEvent } from "./hooks/usePlannerEvents";
import { useTripStore } from "../../stores/tripStore";
import * as imageResolver from "../trips/resolveDestinationImage";

const base: DecoratedEvent = {
  id: "e1", tripId: "t1", dayIndex: 0, order: 0, kind: "place",
  title: "Eiffel Tower", time: "09:00", openHours: "09:30–23:00",
  notes: ["a", "b", "c", "d"], outOfOrder: false,
};

test("renders title and timing line", () => {
  render(<EventCard event={base} onEditNotes={() => {}} onRemove={() => {}} />);
  expect(screen.getByText("Eiffel Tower")).toBeInTheDocument();
  expect(screen.getByText(/09:00/)).toBeInTheDocument();
  expect(screen.getByText(/09:30–23:00/)).toBeInTheDocument();
});

test("shows the out-of-order hint only when flagged", () => {
  const { rerender } = render(<EventCard event={base} onEditNotes={() => {}} onRemove={() => {}} />);
  expect(screen.queryByText(/earlier than the stop above/i)).not.toBeInTheDocument();
  rerender(<EventCard event={{ ...base, outOfOrder: true }} onEditNotes={() => {}} onRemove={() => {}} />);
  expect(screen.getByText(/earlier than the stop above/i)).toBeInTheDocument();
});

test("expanding notes calls onEditNotes", async () => {
  const onEditNotes = jest.fn();
  render(<EventCard event={base} onEditNotes={onEditNotes} onRemove={() => {}} />);
  await userEvent.click(screen.getByText("+1 more notes"));
  expect(onEditNotes).toHaveBeenCalledWith("e1");
});

test("persists a resolved image to the event so it is not re-fetched", async () => {
  useTripStore.setState({
    trips: [],
    events: [{ id: "e1", tripId: "t1", dayIndex: 0, order: 0, kind: "place", title: "Eiffel Tower", notes: [] }],
  });
  jest
    .spyOn(imageResolver, "resolveDestinationImage")
    .mockResolvedValue("https://img/eiffel.jpg");

  render(<EventCard event={base} onEditNotes={() => {}} onRemove={() => {}} />);

  await waitFor(() => {
    const found = useTripStore.getState().events.find((e) => e.id === "e1");
    expect(found?.imageUrl).toBe("https://img/eiffel.jpg");
  });
});
