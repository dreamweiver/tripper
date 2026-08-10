import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ thumbnail: { source: "https://img/x.jpg" } }),
  }) as unknown as typeof fetch;
});
afterEach(() => jest.restoreAllMocks());

test("renders the trip list at the root route", () => {
  window.history.pushState({}, "", "/");
  render(<App />);
  expect(screen.getByText(/no trips yet/i)).toBeInTheDocument();
});
