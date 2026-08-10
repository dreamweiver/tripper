import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotesModal } from "./NotesModal";

test("does not render when closed", () => {
  render(<NotesModal title="Eiffel" notes={["a"]} open={false} onSave={() => {}} onClose={() => {}} />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("shows all notes when open", () => {
  render(<NotesModal title="Eiffel" notes={["a", "b", "c", "d"]} open onSave={() => {}} onClose={() => {}} />);
  expect(screen.getAllByRole("listitem")).toHaveLength(4);
});

test("save emits the edited notes as an array (one per line)", async () => {
  const onSave = jest.fn();
  render(<NotesModal title="Eiffel" notes={["a"]} open onSave={onSave} onClose={() => {}} />);
  const box = screen.getByRole("textbox");
  await userEvent.clear(box);
  await userEvent.type(box, "one{enter}two");
  await userEvent.click(screen.getByRole("button", { name: /save/i }));
  expect(onSave).toHaveBeenCalledWith(["one", "two"]);
});
