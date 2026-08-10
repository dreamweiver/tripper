import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Connector } from "./Connector";

test("renders an insert button that fires onInsert", async () => {
  const onInsert = jest.fn();
  render(<Connector onInsert={onInsert} />);
  await userEvent.click(screen.getByRole("button", { name: /insert place here/i }));
  expect(onInsert).toHaveBeenCalled();
});
