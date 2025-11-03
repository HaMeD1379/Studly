import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { LoginForm } from "./Login";
import "@testing-library/jest-dom";
import { notifications } from "@mantine/notifications";
import fetchPolyfill, { Request as RequestPolyfill } from "node-fetch";
import { createMemoryRouter, RouterProvider, redirect } from "react-router-dom";
import { loginAction } from "~/routes";
import * as auth from "~/api/auth";
import { render } from "~/utilities/testing";

//Lines 15 - 24 were provided through an online github repo as solution to the error:
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
  { action: loginAction, element: <LoginForm />, path: "/" },
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
      color: "red",
      message: "Provide a valid Email",
      title: "Mismatch",
    });
  });

  it("Navigates to /study after successful login", async () => {
    (auth.login as Mock).mockResolvedValue({
      data: {
        data: {
          session: { access_token: "abc123" },
          user: {
            email: "testuser@gmail.com",
            id: "1",
            full_name: "test user",
          },
        },
      },
      error: null,
    });
    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "password123");

    const req = new Request("http://localhost/", {
      body: formData,
      method: "POST",
    });

    const result = await loginAction({
      context: {},
      params: {},
      request: req,
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
