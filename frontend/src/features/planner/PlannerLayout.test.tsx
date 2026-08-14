import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlannerLayout } from "./PlannerLayout";

test("renders both slots and switches the active panel via tabs", async () => {
  const { container } = render(
    <PlannerLayout timeline={<div>TIMELINE</div>} map={<div>MAP</div>} />,
  );
  expect(screen.getByText("TIMELINE")).toBeInTheDocument();
  expect(screen.getByText("MAP")).toBeInTheDocument();

  const layout = container.firstElementChild;
  expect(layout).toHaveAttribute("data-active", "timeline");
  expect(screen.getByRole("tab", { name: /timeline/i })).toHaveAttribute("aria-selected", "true");

  await userEvent.click(screen.getByRole("tab", { name: /map/i }));
  expect(layout).toHaveAttribute("data-active", "map");
  expect(screen.getByRole("tab", { name: /map/i })).toHaveAttribute("aria-selected", "true");
});
