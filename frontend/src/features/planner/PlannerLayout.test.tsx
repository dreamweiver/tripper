import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlannerLayout } from "./PlannerLayout";

test("renders timeline slot and can switch to the map tab", async () => {
  render(<PlannerLayout timeline={<div>TIMELINE</div>} map={<div>MAP</div>} />);
  expect(screen.getByText("TIMELINE")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("tab", { name: /map/i }));
  expect(screen.getByText("MAP")).toBeInTheDocument();
});
