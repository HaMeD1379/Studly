const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/" }),
  };
});
import { expect, describe, it, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { render } from "~/utilities/testing";
import { Navbar } from "./Navbar";
import { createMemoryRouter, RouterProvider, redirect } from "react-router-dom";
import { logoutAction } from "~/actions/logout";
import { LoginForm } from "~/components";
import * as logoutApi from "~/api/auth";
import fetchPolyfill, { Request as RequestPolyfill } from "node-fetch";

Object.defineProperty(global, "fetch", {
  // MSW will overwrite this to intercept requests
  writable: true,
  value: fetchPolyfill,
});

Object.defineProperty(global, "Request", {
  writable: false,
  value: RequestPolyfill,
});
vi.mock("~/api/auth", () => ({
  logout: vi.fn(),
}));
describe("Navbar", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  const router_2 = createMemoryRouter(
    [
      {
        path: "/",
        element: <Navbar>MOCK_CHILDREN</Navbar>,
        children: [
          { path: "home", element: <div>Home Page</div> },
          { path: "study", element: <div>Study Session</div> },
          { path: "badges", element: <div>Badges Page</div> },
        ],
      },
      {
        path: "/logout",
        action: logoutAction,
      },
      {
        path: "/login",
        element: <LoginForm />,
      },
    ],
    {
      initialEntries: ["/"], // start on the Navbar route
    }
  );
  const router = createMemoryRouter([
    { path: "/", element: <Navbar>MOCK_CHILDREN</Navbar> },
  ]);

  it("renders all navigations", () => {
    render(<RouterProvider router={router} />);
    expect(screen.getByText("Studly")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Home" })).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Study Session" })
    ).not.toBeNull();
    expect(screen.getByRole("button", { name: "Badges" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Logout" })).not.toBeNull();
    expect(screen.getByText("MOCK_CHILDREN")).not.toBeNull();
  });

  it("navigations are called to the proper route", () => {
    render(<RouterProvider router={router} />);

    const homeButton = screen.getByRole("button", { name: "Home" });
    const studySessionButton = screen.getByRole("button", {
      name: "Study Session",
    });
    const badgesButton = screen.getByRole("button", { name: "Badges" });
    const logoutButton = screen.getByRole("button", { name: "Logout" });

    fireEvent.click(homeButton);
    expect(mockNavigate).toHaveBeenCalledWith("/home");
    mockNavigate.mockClear();

    fireEvent.click(studySessionButton);
    expect(mockNavigate).toHaveBeenCalledWith("/study");
    mockNavigate.mockClear();

    fireEvent.click(badgesButton);
    expect(mockNavigate).toHaveBeenCalledWith("/badges");
    mockNavigate.mockClear();

    fireEvent.click(logoutButton);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
  it("navigates to the login page when logout button is clicked", async () => {
    // Arrange: mock API and localStorage
    (logoutApi.logout as any).mockResolvedValue({
      message: "Logout successful",
      data: {},
    });
    localStorage.setItem("accessToken", "abc123");

    const req = new Request("http://localhost:5173/logout", {
      method: "POST",
      headers: { Authorization: "Bearer abc123" },
    });

    // Act: call the action
    const result = await logoutAction();

    // Assert: redirect and localStorage cleared inside the action
    expect(result).toEqual(redirect("/"));
    expect(localStorage.getItem("accessToken")).toBeNull();
  });
});
