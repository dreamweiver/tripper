import { render, screen } from "@testing-library/react";
import App from "./App.js";

test("renders the Tripper heading", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /tripper/i })).toBeInTheDocument();
});
