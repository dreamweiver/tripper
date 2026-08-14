import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Suggestions } from "./Suggestions";
import type { SuggestionItem } from "./SuggestionCard";

const items = [
  { title: "Tuileries Garden", category: "leisure", distance: 300, lat: 48.86, lon: 2.32 },
  { title: "Palais Royal", category: "tourism", distance: 400, lat: 48.86, lon: 2.33 },
];

const makeItems = (n: number): SuggestionItem[] =>
  Array.from({ length: n }, (_, i) => ({
    title: `Place ${i + 1}`,
    category: "tourism",
    lat: 48 + i / 1000,
    lon: 2 + i / 1000,
  }));

test("renders the day-end heading and the items", () => {
  render(
    <Suggestions
      placement="day-end"
      items={items}
      loading={false}
      error={null}
      onAdd={() => {}}
      onRetry={() => {}}
    />,
  );
  expect(screen.getByText(/near your last stop/i)).toBeInTheDocument();
  expect(screen.getByText("Tuileries Garden")).toBeInTheDocument();
});

test("fires onAdd with the item when its add button is clicked", async () => {
  const onAdd = jest.fn();
  render(
    <Suggestions
      placement="day-end"
      items={items}
      loading={false}
      error={null}
      onAdd={onAdd}
      onRetry={() => {}}
    />,
  );
  await userEvent.click(screen.getAllByRole("button", { name: /add/i })[0]!);
  expect(onAdd).toHaveBeenCalledWith(items[0]);
});

test("shows an error with a retry button", async () => {
  const onRetry = jest.fn();
  render(
    <Suggestions
      placement="day-end"
      items={[]}
      loading={false}
      error="Couldn't load suggestions"
      onAdd={() => {}}
      onRetry={onRetry}
    />,
  );
  expect(screen.getByText(/couldn't load suggestions/i)).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /retry/i }));
  expect(onRetry).toHaveBeenCalled();
});

test("renders nothing when not loading, no error, and no items", () => {
  const { container } = render(
    <Suggestions
      placement="day-end"
      items={[]}
      loading={false}
      error={null}
      onAdd={() => {}}
      onRetry={() => {}}
    />,
  );
  expect(container).toBeEmptyDOMElement();
});

describe("pagination", () => {
  beforeEach(() => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({}) }) as unknown as typeof fetch;
  });
  afterEach(() => jest.restoreAllMocks());

  test("shows only the first 10 items with a Show more button", () => {
    render(
      <Suggestions
        placement="day-end"
        items={makeItems(25)}
        loading={false}
        error={null}
        onAdd={() => {}}
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText("Place 10")).toBeInTheDocument();
    expect(screen.queryByText("Place 11")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /show more/i })).toBeInTheDocument();
  });

  test("Show more reveals the next 10 items", async () => {
    render(
      <Suggestions
        placement="day-end"
        items={makeItems(25)}
        loading={false}
        error={null}
        onAdd={() => {}}
        onRetry={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /show more/i }));
    expect(screen.getByText("Place 20")).toBeInTheDocument();
    expect(screen.queryByText("Place 21")).not.toBeInTheDocument();
  });

  test("resets to the first page when resetKey changes", async () => {
    const { rerender } = render(
      <Suggestions
        placement="day-end"
        items={makeItems(25)}
        loading={false}
        error={null}
        onAdd={() => {}}
        onRetry={() => {}}
        resetKey="a"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /show more/i }));
    expect(screen.getByText("Place 20")).toBeInTheDocument();

    rerender(
      <Suggestions
        placement="day-end"
        items={makeItems(25)}
        loading={false}
        error={null}
        onAdd={() => {}}
        onRetry={() => {}}
        resetKey="b"
      />,
    );
    expect(screen.queryByText("Place 11")).not.toBeInTheDocument();
  });

  test("keeps items visible during a background refetch instead of blanking", () => {
    render(
      <Suggestions
        placement="day-end"
        items={makeItems(3)}
        loading
        error={null}
        onAdd={() => {}}
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText("Place 1")).toBeInTheDocument();
  });
});
