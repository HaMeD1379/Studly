import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginForm } from "./LoginForm";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { MemoryRouter } from "react-router-dom";
import { notifications } from "@mantine/notifications";

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

describe("Login Tests", () => {
  it("Shows email and password fields", () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <LoginForm />
        </MantineProvider>
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });
  it("Shows an error if invalid email is provided", async () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <LoginForm />
        </MantineProvider>
      </MemoryRouter>
    );
    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/Password/i);
    const signUpButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(email, { target: { value: "invalidemail" } });
    fireEvent.change(password, { target: { value: "0106Abcd" } });
    fireEvent.click(signUpButton);
    expect(notifications.show).toHaveBeenCalledWith({
      title: "Mismatch",
      message: "Provide a valid Email",
      color: "red",
    });
  });

  it("navigates to home page (/study) after successful login", async () => {
    render(
      <MantineProvider>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </MantineProvider>
    );
    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/Password/i);
    const signInButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(email, { target: { value: "test@gmail.com" } });
    fireEvent.change(password, { target: { value: "Pass123*" } });
    fireEvent.click(signInButton);
    expect(mockNavigate).toHaveBeenCalledWith("/study");
  });
});
