import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateTripForm } from "./CreateTripForm";

describe("CreateTripForm", () => {
  it("shows a validation error when destination is empty on submit", async () => {
    render(<CreateTripForm onSubmit={jest.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /start planning/i }));
    expect(await screen.findByLabelText(/where to/i)).toHaveAccessibleDescription("Where to?");
  });

  it("calls onSubmit with the range picked on the calendar", async () => {
    // Freeze "today" so the calendar opens on a known month with specific day cells.
    jest.useFakeTimers({ now: new Date(2999, 0, 1) });
    try {
      const onSubmit = jest.fn();
      render(<CreateTripForm onSubmit={onSubmit} />);
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      await user.type(screen.getByLabelText(/where to/i), "Paris");
      await user.click(screen.getByRole("button", { name: /January 1st, 2999/ }));
      await user.click(screen.getByRole("button", { name: /January 5th, 2999/ }));
      await user.click(screen.getByRole("button", { name: /start planning/i }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: "Paris",
          startDate: "2999-01-01",
          endDate: "2999-01-05",
        }),
      );
    } finally {
      jest.useRealTimers();
    }
  });
});
