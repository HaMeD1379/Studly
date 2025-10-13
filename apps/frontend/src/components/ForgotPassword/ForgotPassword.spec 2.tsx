vi.mock("@mantine/notifications", () => ({
  notifications: {
    show: vi.fn(),
  },
}));

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ForgotPassword } from "./ForgotPassword";
import "@testing-library/jest-dom";
import { MantineProvider } from "@mantine/core";
import { MemoryRouter } from "react-router";
import { notifications } from "@mantine/notifications";
import { vi } from "vitest";

describe("Sign up activity", () => {
  it("Shows email and password fields", () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <ForgotPassword />
        </MantineProvider>
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/Your email/i)).toBeInTheDocument();
  });
  it("shows a notification for an invalid email", () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <ForgotPassword />
        </MantineProvider>
      </MemoryRouter>
    );
    const emailInput = screen.getByLabelText(/Your email/i);
    const forgotButton = screen.getByRole("button", {
      name: /Reset password/i,
    });
    fireEvent.change(emailInput, { target: { value: "invalidEmail" } });
    fireEvent.click(forgotButton);

    expect(notifications.show).toHaveBeenCalledWith({
      title: "Mismatch",
      message: "Provide a valid Email",
      color: "red",
    });
  });
});
