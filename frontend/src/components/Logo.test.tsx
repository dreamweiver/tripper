import { render, screen } from "@testing-library/react";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("renders an accessible image labelled Tripper by default", () => {
    render(<Logo />);
    expect(screen.getByRole("img", { name: /tripper/i })).toBeInTheDocument();
  });

  it("uses a custom accessible title when provided", () => {
    render(<Logo title="Tripper home" />);
    expect(screen.getByRole("img", { name: /tripper home/i })).toBeInTheDocument();
  });

  it("applies the requested size to the svg", () => {
    const { container } = render(<Logo size={48} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "48");
    expect(svg).toHaveAttribute("height", "48");
  });

  it("passes through a className", () => {
    const { container } = render(<Logo className="brand-mark" />);
    expect(container.querySelector("svg")).toHaveClass("brand-mark");
  });
});
