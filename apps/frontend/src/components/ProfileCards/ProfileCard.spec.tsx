import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { render } from "~/utilities/testing";
import { UserProfile } from "~/routes";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

describe("Profile Card tests", () => {
  const router = createMemoryRouter([
    {
      element: <UserProfile />,
      path: "/",
    },
  ]);
  it("displays all elements", () => {
    render(<RouterProvider router={router} />);
    const day_streak = screen.getByTestId("day-streak-card");
    const total_study = screen.getByTestId("total-study-card");
    const badges = screen.getByTestId("badges-card");
    const friends = screen.getByTestId("friends-card");
    expect(day_streak).toHaveTextContent("Day Streak");
    expect(total_study).toHaveTextContent("Total Study");
    expect(badges).toHaveTextContent("Badges");
    expect(friends).toHaveTextContent("Friends");
  });
});
