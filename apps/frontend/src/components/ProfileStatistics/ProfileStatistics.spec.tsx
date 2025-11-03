import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { UserProfile } from "~/routes";
import { render } from "~/utilities/testing";
import { screen } from "@testing-library/react";

const router = createMemoryRouter([{ element: <UserProfile />, path: "/" }]);
describe("Profile Statistics Tests", () => {
  it("renders all elements", () => {
    render(<RouterProvider router={router} />);
    const this_week = screen.getByTestId("this-week-card");
    const subject_distribution = screen.getByTestId(
      "subject-distribution-card"
    );
    const recent_badges = screen.getByTestId("recent-badges-card");
    expect(this_week).toHaveTextContent("This Week");
    expect(subject_distribution).toHaveTextContent("Subject Distribution");
    expect(recent_badges).toHaveTextContent("Recent Badges");
  });
});
