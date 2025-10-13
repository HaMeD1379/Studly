import { describe, it, expect } from "vitest";
import { equalPasswords } from "./passwordValidation";
import { render, screen, fireEvent } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { notifications } from "@mantine/notifications";
import { LoginForm } from "~/components";

vi.mock("@mantine/notifications", () => ({
  notifications: {
    show: vi.fn(),
  },
}));

describe("Password Validation Tests", () => {
  it("returns true for equal passwords (boundary testing length = 8)", () => {
    expect(equalPasswords("Pass123*", "Pass123*")).toBe(true);
  });

  it("returns false for different passwords", () => {
    expect(equalPasswords("Pass123*", "Pass1234*")).toBe(false);
    expect(notifications.show).toHaveBeenCalledWith({
      title: "Mismatch",
      message: "Passwords do not match",
      color: "red",
    });
  });
  it("returns weak password for no lowercase letters", () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <LoginForm />
        </MantineProvider>
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "PASSWORD123*" } }); // all uppercase

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitButton);

    expect(notifications.show).toHaveBeenCalledWith({
      title: "Weak Password",
      message: "Password must contain a lowercase letter",
      color: "red",
    });
  });

  it("returns weak password for no uppercase letters", () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <LoginForm />
        </MantineProvider>
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "password12*" } });

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitButton);

    expect(notifications.show).toHaveBeenCalledWith({
      title: "Weak Password",
      message: "Password must contain an uppercase letter",
      color: "red",
    });
  });
  it("returns weak password for no special characters", () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <LoginForm />
        </MantineProvider>
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123" } });

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitButton);

    expect(notifications.show).toHaveBeenCalledWith({
      title: "Weak Password",
      message: "Password must contain a special character",
      color: "red",
    });
  });
  it("returns weak password for no digits", () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <LoginForm />
        </MantineProvider>
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password*" } });

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitButton);

    expect(notifications.show).toHaveBeenCalledWith({
      title: "Weak Password",
      message: "Password must contain a number",
      color: "red",
    });
  });
  it("returns weak password for length less than 8 (boundary testing 7)", () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <LoginForm />
        </MantineProvider>
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "Pass12*" } });

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitButton);

    expect(notifications.show).toHaveBeenCalledWith({
      title: "Weak Password",
      message: "Password must be longer than 8 characters",
      color: "red",
    });
  });
});
