import { describe, it, expect } from "vitest";
import { equalPasswords } from "./passwordValidation";
import { screen, fireEvent } from "@testing-library/react";
import { render } from "../testing";
import { vi } from "vitest";
import { notifications } from "@mantine/notifications";
import { SignUpForm } from "~/components";
import { SignUpAction } from "~/actions";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

vi.mock("@mantine/notifications", () => ({
  notifications: {
    show: vi.fn(),
  },
}));

const router = createMemoryRouter([
  { path: "/", element: <SignUpForm />, action: SignUpAction },
]);

describe("Password Validation Tests", () => {
  it("returns true for equal passwords (boundary testing length = 8)", () => {
    expect(equalPasswords("Pass123*", "Pass123*")).toBe(true);
  });

  it("returns false for different passwords", () => {
    expect(equalPasswords("Pass123*", "Pass1234*")).toBe(false);
    expect(notifications.show).toHaveBeenCalledWith({
      color: "red",
      message: "Passwords do not match",
      title: "Mismatch",
    });
  });
  it("returns weak password for no lowercase letters", () => {
    render(<RouterProvider router={router} />);
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/create password/i);
    const password_2 = screen.getByLabelText(/confirm password/i);
    const checkbox = screen.getByLabelText(
      /I agree to the Terms and Conditions/i
    );
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "PASSWORD123*" } }); // all uppercase
    fireEvent.change(password_2, { target: { value: "PASSWORD123*" } });
    fireEvent.click(checkbox);
    const submitButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(submitButton);

    expect(notifications.show).toHaveBeenCalledWith({
      color: "red",
      message: "Password must contain a lowercase letter",
      title: "Weak Password",
    });
  });

  it("returns weak password for no uppercase letters", () => {
    render(<RouterProvider router={router} />);
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/create password/i);
    const password_2 = screen.getByLabelText(/confirm password/i);
    const checkbox = screen.getByLabelText(
      /I agree to the Terms and Conditions/i
    );
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "password12*" } }); // all uppercase
    fireEvent.change(password_2, { target: { value: "password12*" } });
    fireEvent.click(checkbox);
    const submitButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(submitButton);

    expect(notifications.show).toHaveBeenCalledWith({
      color: "red",
      message: "Password must contain an uppercase letter",
      title: "Weak Password",
    });
  });
  it("returns weak password for no special characters", () => {
    render(<RouterProvider router={router} />);
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/create password/i);
    const password_2 = screen.getByLabelText(/confirm password/i);
    const checkbox = screen.getByLabelText(
      /I agree to the Terms and Conditions/i
    );
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password12" } }); // all uppercase
    fireEvent.change(password_2, { target: { value: "Password12" } });
    fireEvent.click(checkbox);
    const submitButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(submitButton);

    expect(notifications.show).toHaveBeenCalledWith({
      color: "red",
      message: "Password must contain a special character",
      title: "Weak Password",
    });
  });
  it("returns weak password for no digits", () => {
    render(<RouterProvider router={router} />);
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/create password/i);
    const password_2 = screen.getByLabelText(/confirm password/i);
    const checkbox = screen.getByLabelText(
      /I agree to the Terms and Conditions/i
    );
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password*" } }); // all uppercase
    fireEvent.change(password_2, { target: { value: "Password*" } });
    fireEvent.click(checkbox);
    const submitButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(submitButton);

    expect(notifications.show).toHaveBeenCalledWith({
      color: "red",
      message: "Password must contain a number",
      title: "Weak Password",
    });
  });
  it("returns weak password for length less than 8 (boundary testing 7)", () => {
    render(<RouterProvider router={router} />);
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/create password/i);
    const password_2 = screen.getByLabelText(/confirm password/i);
    const checkbox = screen.getByLabelText(
      /I agree to the Terms and Conditions/i
    );
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "Pass12*" } }); // all uppercase
    fireEvent.change(password_2, { target: { value: "Pass12*" } });
    fireEvent.click(checkbox);
    const submitButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(submitButton);

    expect(notifications.show).toHaveBeenCalledWith({
      color: "red",
      message: "Password must be longer than 8 characters",
      title: "Weak Password",
    });
  });
});
