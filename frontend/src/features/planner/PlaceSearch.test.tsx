import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlaceSearch } from "./PlaceSearch";

afterEach(() => jest.restoreAllMocks());

test("submitting a query lists results and picking one fires onPick", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [
      {
        title: "Louvre Museum, Paris",
        name: "Louvre Museum",
        address: "Paris",
        lat: 48.86,
        lon: 2.33,
        category: "tourism",
        type: "museum",
      },
    ],
  }) as unknown as typeof fetch;

  const onPick = jest.fn();
  render(<PlaceSearch onClose={() => {}} onPick={onPick} />);
  await userEvent.type(screen.getByRole("searchbox"), "louvre");
  await userEvent.click(screen.getByRole("button", { name: /^search$/i }));

  const result = await screen.findByText("Louvre Museum");
  expect(screen.getByText("Paris")).toBeInTheDocument();
  await userEvent.click(result);
  expect(onPick).toHaveBeenCalledWith(
    expect.objectContaining({ name: "Louvre Museum", lat: 48.86, lon: 2.33 }),
  );
});

test("does not show the empty-state before a search runs", () => {
  render(<PlaceSearch onClose={() => {}} onPick={() => {}} />);
  expect(screen.queryByText(/no places found/i)).not.toBeInTheDocument();
});

test("shows the empty-state only after a search returns nothing", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => [] }) as unknown as typeof fetch;
  render(<PlaceSearch onClose={() => {}} onPick={() => {}} />);
  await userEvent.type(screen.getByRole("searchbox"), "zzz");
  await userEvent.click(screen.getByRole("button", { name: /^search$/i }));
  expect(await screen.findByText(/no places found/i)).toBeInTheDocument();
});

test("renders prefilled initialResults and a custom title", () => {
  render(
    <PlaceSearch
      title="Add an eatery"
      initialResults={[
        {
          title: "Café de Flore",
          name: "Café de Flore",
          address: "Paris",
          lat: 1,
          lon: 2,
          category: "amenity",
          type: "cafe",
        },
      ]}
      onClose={() => {}}
      onPick={() => {}}
    />,
  );
  expect(screen.getByRole("dialog", { name: /add an eatery/i })).toBeInTheDocument();
  expect(screen.getByText("Café de Flore")).toBeInTheDocument();
});

test("shows a loading spinner while initialLoading is true and no results yet", () => {
  render(<PlaceSearch title="Add an eatery" initialLoading onClose={() => {}} onPick={() => {}} />);
  expect(screen.getByText(/finding eateries/i)).toBeInTheDocument();
  expect(screen.getByRole("status")).toBeInTheDocument();
});

test("replaces the spinner with results once late initialResults arrive", () => {
  const eatery = {
    title: "Café de Flore",
    name: "Café de Flore",
    address: "Paris",
    lat: 1,
    lon: 2,
    category: "amenity",
    type: "cafe",
  };
  const { rerender } = render(
    <PlaceSearch title="Add an eatery" initialLoading onClose={() => {}} onPick={() => {}} />,
  );
  expect(screen.getByText(/finding eateries/i)).toBeInTheDocument();

  rerender(
    <PlaceSearch
      title="Add an eatery"
      initialLoading={false}
      initialResults={[eatery]}
      onClose={() => {}}
      onPick={() => {}}
    />,
  );
  expect(screen.queryByText(/finding eateries/i)).not.toBeInTheDocument();
  expect(screen.getByText("Café de Flore")).toBeInTheDocument();
});
