import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { LoginForm } from "./Login";
import "@testing-library/jest-dom";
import { notifications } from "@mantine/notifications";
import { render } from "~/utilities/testing";
import { createMemoryRouter, RouterProvider, redirect } from "react-router-dom";
import { loginAction } from "~/actions";
import * as auth from "~/api/auth";
import fetchPolyfill, { Request as RequestPolyfill } from "node-fetch";

//Lines 15 - 24 were provided through an online github repo as solution to the error:
//RequestInit: Expected signal ("AbortSignal {}") to be an instance of AbortSignal.
//Link: https://github.com/reduxjs/redux-toolkit/issues/4966
Object.defineProperty(global, "fetch", {
  // MSW will overwrite this to intercept requests
  writable: true,
  value: fetchPolyfill,
});

Object.defineProperty(global, "Request", {
  writable: false,
  value: RequestPolyfill,
});

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock Mantine notifications
vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

vi.mock("~/api/auth", () => ({
  login: vi.fn(),
}));

const router = createMemoryRouter([
  { path: "/", element: <LoginForm />, action: loginAction },
]);

describe("Login Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Shows email and password fields", () => {
    render(<RouterProvider router={router} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("Shows an error if invalid email is provided", async () => {
    render(<RouterProvider router={router} />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalidemail" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "0106Abcd" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(notifications.show).toHaveBeenCalledWith({
      title: "Mismatch",
      message: "Provide a valid Email",
      color: "red",
    });
  });

  it("Navigates to /study after successful login", async () => {
    (auth.login as any).mockResolvedValue({
      data: {
        data: {
          session: { access_token: "abc123" },
        },
      },
      error: null,
    });
    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "password123");

    const req = new Request("http://localhost/", {
      method: "POST",
      body: formData,
    });

    const result = await loginAction({
      request: req,
      params: {},
      context: {},
    });

    expect(result).toEqual(redirect("/study"));
  });

  it("Navigates to forgot password page", () => {
    render(<RouterProvider router={router} />);
    fireEvent.click(screen.getByText(/Forgot password\?/i));
    expect(mockNavigate).toHaveBeenCalledWith("/forgot-password");
  });

  it("Navitates to signup page", () => {
    render(<RouterProvider router={router} />);
    fireEvent.click(screen.getByText(/Sign Up/i));
    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });
});
