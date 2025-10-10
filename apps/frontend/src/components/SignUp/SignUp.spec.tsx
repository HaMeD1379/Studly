// mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { SignUpForm } from "./SignUp";
import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { MemoryRouter } from "react-router";
import { notifications } from "@mantine/notifications";

vi.mock("@mantine/notifications", () => ({
  notifications: {
    show: vi.fn(),
  },
}));

describe("Sign up activity", () => {
  it("Shows email and password fields", () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Create Password/i)).toBeInTheDocument();
  });
  it("Shows an error if invalid email is provided", async () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>
      </MemoryRouter>
    );
    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/Create Password/i);
    const password_2 = screen.getByLabelText(/Confirm Password/i);
    const signUpButton = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(email, { target: { value: "invalidemail" } });
    fireEvent.change(password, { target: { value: "0106Abcd" } });
    fireEvent.change(password_2, { target: { value: "0106Abcd" } });
    fireEvent.click(signUpButton);
    expect(notifications.show).toHaveBeenCalledWith({
      title: "Mismatch",
      message: "Provide a valid Email",
      color: "red",
    });
  });

  it("navigates to home page (/study) after successful signup", async () => {
    render(
      <MantineProvider>
        <MemoryRouter>
          <SignUpForm />
        </MemoryRouter>
      </MantineProvider>
    );
    const nameInput = screen.getByLabelText(/Full Name/i);
    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/Create Password/i);
    const password_2 = screen.getByLabelText(/Confirm Password/i);
    const signUpButton = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(nameInput, { target: { value: "dummyUser" } });
    fireEvent.change(email, { target: { value: "test@gmail.com" } });
    fireEvent.change(password, { target: { value: "Pass123*" } });
    fireEvent.change(password_2, { target: { value: "Pass123*" } });
    fireEvent.click(signUpButton);
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(
          /Begin Your Gamified Learning experience now/i
        ),
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/study");
  });
});
