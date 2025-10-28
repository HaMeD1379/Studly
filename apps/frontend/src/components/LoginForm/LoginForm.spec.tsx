const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "./LoginForm";
import "@testing-library/jest-dom";
import { notifications } from "@mantine/notifications";
import { render } from "~/utilities/testing";

describe("Login Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Shows email and password fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("Shows an error if invalid email is provided", async () => {
    render(<LoginForm />);
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
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "Pass123*" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/study");
    });
  });

  it("Navigates to forgot password page", () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByText(/Forgot password\?/i));
    expect(mockNavigate).toHaveBeenCalledWith("/forgot-password");
  });

  it("Navigates to signup page", () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByText(/Sign Up/i));
    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });
});
