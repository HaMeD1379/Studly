/// <reference types="vitest" />
import { describe, it, expect, vi } from "vitest";
import { AuthError } from "@supabase/supabase-js";

// --- Mock Supabase client ---
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(async (credentials) => {
        if (
          credentials.email === "test@example.com" &&
          credentials.password === "password123*"
        ) {
          return {
            data: { session: { access_token: "mock_token" } },
            error: null,
          };
        }
        return {
          data: null,
          error: { message: "Invalid credentials" },
        };
      }),

      signUp: vi.fn(async (credentials) => {
        if (credentials.email === "existing@example.com") {
          return {
            data: null,
            error: { message: "User already registered" },
          };
        }

        return {
          data: {
            user: {
              id: "mock-user-id",
              email: credentials.email,
            },
          },
          error: null,
        };
      }),

      signOut: vi.fn(async () => ({
        data: {},
        error: null,
      })),
    },
  })),
}));

// --- Import Supabase and your auth utilities ---
import { createClient } from "@supabase/supabase-js";
const supabase = createClient("mock-url", "mock-key");
import { signIn, signUp } from "./auth";

describe("Supabase Sign In", () => {
  it("should successfully sign in a user with valid credentials", async () => {
    const result = await signIn("test@example.com", "password123*");
    expect(result).toBeDefined();
    expect(result.session).toBeDefined();
    expect(result.session.access_token).toBe("mock_token");
  });

  it("should throw an error for invalid credentials", async () => {
    await expect(
      signIn("invalid@example.com", "wrongpassword")
    ).rejects.toThrow("Invalid credentials");
  });
});

describe("Supabase Sign Up", () => {
  it("should successfully sign up a user with valid credentials", async () => {
    const result = await signUp("test@example.com", "password123", "testUser");
    expect(result).toBeDefined();
    expect(result.user).toBeDefined();
  });

  it("should throw an error if the email already exists", async () => {
    await expect(
      signUp("existing@example.com", "wrongpassword*", "testUser")
    ).rejects.toThrow("User already registered");
  });
});
