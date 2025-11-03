import { render } from "~/utilities/testing";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Avatar } from "./Avatar";
describe("Avatar component Test", () => {
  it("should render an Avatar component", () => {
    localStorage.setItem("full_name", "John Doe");
    render(<Avatar name="John Doe" />);
    const initials = screen.getByText("JD");
    expect(initials).toBeInTheDocument();
  });
});
