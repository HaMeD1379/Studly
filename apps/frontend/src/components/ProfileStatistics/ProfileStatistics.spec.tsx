vi.mock("~/api", () => ({
  fetchBio: vi.fn(),
}));

import { screen } from "@testing-library/react";
import { describe, expect, it, type Mock, vi } from "vitest";
import { render } from "~/utilities/testing";
import { ProfileStatistics } from "./ProfileStatistics";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { ProfileLoader } from "~/routes";
import fetchPolyfill, { Request as RequestPolyfill } from "node-fetch";
import * as auth from "~/api";

const router = createMemoryRouter([
  {
    path: "/",
    element: <ProfileStatistics />,
    loader: ProfileLoader,
  },
]);

//Lines 19 - 28 were provided through an online github repo (https://github.com/reduxjs/redux-toolkit/issues/4966#issuecomment-3115230061) as solution to the error:
//RequestInit: Expected signal ("AbortSignal {}") to be an instance of AbortSignal.
Object.defineProperty(global, "fetch", {
  value: fetchPolyfill,
  // MSW will overwrite this to intercept requests
  writable: true,
});

Object.defineProperty(global, "Request", {
  value: RequestPolyfill,
  writable: false,
});

describe("Profile Statistics Tests", () => {
  beforeEach(() => {
    (auth.SessionSummary as Mock).mockResolvedValue({
      data: {
        totalMinutesStudied: 0,
        sessionsLogged: 0,
      },
      error: null,
    });
  });
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
