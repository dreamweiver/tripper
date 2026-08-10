import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlaceSearch } from "./PlaceSearch";

afterEach(() => jest.restoreAllMocks());

test("submitting a query lists results and picking one fires onPick", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [{ title: "Louvre Museum", lat: 48.86, lon: 2.33, category: "tourism", type: "museum" }],
  }) as unknown as typeof fetch;

  const onPick = jest.fn();
  render(<PlaceSearch open onClose={() => {}} onPick={onPick} />);
  await userEvent.type(screen.getByRole("searchbox"), "louvre");
  await userEvent.click(screen.getByRole("button", { name: /^search$/i }));

  const result = await screen.findByText("Louvre Museum");
  await userEvent.click(result);
  expect(onPick).toHaveBeenCalledWith(
    expect.objectContaining({ title: "Louvre Museum", lat: 48.86, lon: 2.33 }),
  );
});

test("does not render when closed", () => {
  render(<PlaceSearch open={false} onClose={() => {}} onPick={() => {}} />);
  expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
});
