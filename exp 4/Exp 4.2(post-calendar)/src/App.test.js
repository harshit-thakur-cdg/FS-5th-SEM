import {
  render,
  screen
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import App from "./App";

test("renders title", () => {

  render(<App />);

  expect(
    screen.getByText(
      /Social Media Scheduler/i
    )
  ).toBeInTheDocument();

});

test("adds event", async () => {

  render(<App />);

  const button =
    screen.getByText(
      /Add Sample Event/i
    );

  await userEvent.click(button);

  expect(
    screen.getByText(
      /Instagram Post/i
    )
  ).toBeInTheDocument();

});