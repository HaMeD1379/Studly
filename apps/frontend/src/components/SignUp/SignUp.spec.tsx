// mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@mantine/notifications", () => ({
  notifications: {
    show: vi.fn(),
  },
}));

import { describe, it, expect } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { SignUpForm } from "./SignUp";
import "@testing-library/jest-dom";
import { notifications } from "@mantine/notifications";
import { render } from "~/utilities/testing";
import { createMemoryRouter, RouterProvider, redirect } from "react-router-dom";
import * as signupAuth from "~/api/auth";
import fetchPolyfill, { Request as RequestPolyfill } from "node-fetch";
import { SignUpAction } from "~/actions";

Object.defineProperty(global, "fetch", {
  // MSW will overwrite this to intercept requests
  writable: true,
  value: fetchPolyfill,
});

Object.defineProperty(global, "Request", {
  writable: false,
  value: RequestPolyfill,
});

const router = createMemoryRouter([
  { path: "/", element: <SignUpForm />, action: SignUpAction },
]);

vi.mock("~/api/auth", () => ({
  signUp: vi.fn(),
}));

describe("Sign up activity", () => {
  it("Shows email and password fields", () => {
    render(<RouterProvider router={router} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Create Password/i)).toBeInTheDocument();
  });
  it("Shows an error if invalid email is provided", async () => {
    render(<RouterProvider router={router} />);
    const nameInput = screen.getByLabelText(/full name/i);
    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/Create Password/i);
    const password_2 = screen.getByLabelText(/Confirm Password/i);
    const signUpButton = screen.getByRole("button", { name: /sign up/i });
    const checkbox = screen.getByLabelText(
      /I agree to the Terms and Conditions/i
    );
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(email, { target: { value: "invalidemail" } });
    fireEvent.change(password, { target: { value: "0106Abcd" } });
    fireEvent.change(password_2, { target: { value: "0106Abcd" } });
    fireEvent.click(checkbox);
    fireEvent.click(signUpButton);
    expect(notifications.show).toHaveBeenCalledWith({
      title: "Mismatch",
      message: "Provide a valid Email",
      color: "red",
    });
  });

  it("navigates to home page (/study) after successful signup", async () => {
    (signupAuth.signUp as any).mockResolvedValue({ data: { user: {} } });
    const form = new FormData();
    form.append("email", "test@example.com");
    form.append("password", "password123");
    form.append("name", "dummyUser");
    const req = new Request("http://localhost/signup", {
      method: "POST",
      body: form,
    });
    const result = await SignUpAction({
      request: req,
      params: {},
      context: {},
    });
    expect(result).toEqual(redirect("/study"));
  });
});
