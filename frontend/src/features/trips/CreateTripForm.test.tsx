import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateTripForm } from "./CreateTripForm";

describe("CreateTripForm", () => {
  it("shows a validation error when destination is empty on submit", async () => {
    render(<CreateTripForm onSubmit={jest.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /start planning/i }));
    expect(await screen.findByText("Where to?")).toBeInTheDocument();
  });

  it("calls onSubmit with valid values", async () => {
    const onSubmit = jest.fn();
    render(<CreateTripForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/where to/i), "Paris");
    await userEvent.type(screen.getByLabelText(/start date/i), "2999-01-01");
    await userEvent.type(screen.getByLabelText(/end date/i), "2999-01-05");
    await userEvent.click(screen.getByRole("button", { name: /start planning/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: "Paris",
        startDate: "2999-01-01",
        endDate: "2999-01-05",
      }),
    );
  });
});
