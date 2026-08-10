import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotesList } from "./NotesList";

test("renders nothing when there are no notes", () => {
  const { container } = render(<NotesList notes={[]} onExpand={() => {}} />);
  expect(container).toBeEmptyDOMElement();
});

test("shows up to 3 notes and no more-link when 3 or fewer", () => {
  render(<NotesList notes={["a", "b", "c"]} onExpand={() => {}} />);
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
  expect(screen.queryByText(/more/i)).not.toBeInTheDocument();
});

test("shows 3 notes plus a '+N more' link when there are more than 3", async () => {
  const onExpand = jest.fn();
  render(<NotesList notes={["a", "b", "c", "d", "e"]} onExpand={onExpand} />);
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
  const more = screen.getByText("+2 more notes");
  await userEvent.click(more);
  expect(onExpand).toHaveBeenCalled();
});
