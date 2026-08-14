import { render, screen } from "@testing-library/react";
import { PlaceImage } from "./PlaceImage";

test("renders an img with the cached src and empty alt (decorative)", () => {
  render(<PlaceImage title="Louvre" cachedUrl="https://img/louvre.jpg" />);
  const img = screen.getByRole("presentation") as HTMLImageElement;
  expect(img.src).toContain("https://img/louvre.jpg");
});
