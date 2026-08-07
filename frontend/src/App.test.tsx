import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
});

describe("App", () => {
  it("renders the trip list screen", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /your trips/i })).toBeInTheDocument();
  });
});
