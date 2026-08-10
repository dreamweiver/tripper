import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Suggestions } from "./Suggestions";

const items = [
  { title: "Tuileries Garden", category: "leisure", distance: 300, lat: 48.86, lon: 2.32 },
  { title: "Palais Royal", category: "tourism", distance: 400, lat: 48.86, lon: 2.33 },
];

test("renders the day-end heading and the items", () => {
  render(<Suggestions placement="day-end" items={items} loading={false} error={null} onAdd={() => {}} onRetry={() => {}} />);
  expect(screen.getByText(/near your last stop/i)).toBeInTheDocument();
  expect(screen.getByText("Tuileries Garden")).toBeInTheDocument();
});

test("fires onAdd with the item when its add button is clicked", async () => {
  const onAdd = jest.fn();
  render(<Suggestions placement="day-end" items={items} loading={false} error={null} onAdd={onAdd} onRetry={() => {}} />);
  await userEvent.click(screen.getAllByRole("button", { name: /add/i })[0]!);
  expect(onAdd).toHaveBeenCalledWith(items[0]);
});

test("shows an error with a retry button", async () => {
  const onRetry = jest.fn();
  render(<Suggestions placement="day-end" items={[]} loading={false} error="Couldn't load suggestions" onAdd={() => {}} onRetry={onRetry} />);
  expect(screen.getByText(/couldn't load suggestions/i)).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /retry/i }));
  expect(onRetry).toHaveBeenCalled();
});

test("renders nothing when not loading, no error, and no items", () => {
  const { container } = render(<Suggestions placement="day-end" items={[]} loading={false} error={null} onAdd={() => {}} onRetry={() => {}} />);
  expect(container).toBeEmptyDOMElement();
});
