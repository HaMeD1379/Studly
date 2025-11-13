vi.mock("~/api", () => ({
  fetchBio: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

import { fireEvent, screen } from "@testing-library/react";
import fetchPolyfill, { Request as RequestPolyfill } from "node-fetch";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it, type Mock, vi } from "vitest";
import * as auth from "~/api";
import { PageSpinner } from "~/components";
import { profileString } from "~/constants";
import { ProfileLoader } from "~/routes";
import { render } from "~/utilities/testing";
import { UserCard } from "./UserCard";

//Lines 21 - 30 were provided through an online github repo as solution to the error:
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

describe("Profile Card tests", () => {
  const router = createMemoryRouter([
    {
      element: <UserCard />,
      loader: ProfileLoader,
      path: "/",
    },
  ]);
  it("displays all elements", () => {
    localStorage.setItem("fullName", "Test User");
    localStorage.setItem("email", "testUser@gmail.com");
    render(<RouterProvider router={router} />);
    const name_field = screen.getByTestId("name-text");
    const email_field = screen.getByTestId("email-text");
    const bio_field = screen.getByTestId("bio-text");
    const edit_btn = screen.getByTestId("edit-btn");
    const share_btn = screen.getByTestId("share-btn");
    expect(name_field).toHaveTextContent(`${localStorage.getItem("fullName")}`);
    expect(email_field).toHaveTextContent(`${localStorage.getItem("email")}`);
    expect(bio_field).toHaveTextContent(`${profileString.default}`);
    expect(edit_btn).toHaveTextContent("Edit");
    expect(share_btn).toHaveTextContent("Share");
  });
  it("naviagtes to settings when edit button is clicked", () => {
    render(<RouterProvider router={router} />);
    fireEvent.click(screen.getByTestId("edit-btn"));
    expect(mockNavigate).toHaveBeenCalledWith("/settings");
  });
  it("displays the result from the fetch bio api call in the bio field", () => {
    localStorage.setItem("userId", "1");
    localStorage.setItem("fullName", "Test User");
    localStorage.setItem("email", "testUser@gmail.com");

    (auth.fetchBio as Mock).mockResolvedValue({
      data: {
        data: {
          bio: "This is my Bio",
          user_id: "1",
        },
      },
      error: null,
    });

    const router = createMemoryRouter([
      {
        element: <UserCard />,
        hydrateFallbackElement: <PageSpinner />,
        loader: ProfileLoader,
        path: "/",
      },
    ]);

    render(<RouterProvider router={router} />);
  });
});
