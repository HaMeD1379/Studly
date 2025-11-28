import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FindFriends } from "./FindFriends";
import { useLoaderData, useSubmit } from "react-router";
import { userInfo } from "~/store";

// ---- MOCKS ----
vi.mock("react-router", () => ({
  useLoaderData: vi.fn(),
  useSubmit: vi.fn(),
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
}));

vi.mock("~/store", () => ({
  userInfo: vi.fn(),
}));

// Mantine UI mocks
vi.mock("@mantine/core", () => ({
  Box: ({ children }: any) => <div>{children}</div>,
  SimpleGrid: ({ children }: any) => <div>{children}</div>,
  ScrollArea: ({ children }: any) => <div>{children}</div>,
  Center: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <div>{children}</div>,
  Flex: ({ children }: any) => <div>{children}</div>,
  Card: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  Input: (props: any) => <input {...props} />,
}));

vi.mock("../Avatar/Avatar", () => ({
  Avatar: () => <div data-testid="avatar" />,
}));

// ---- TEST DATA ----
const FRIENDS = [{ id: "1", name: "Alice" }];

const RESULTS = [
  {
    user_id: "2",
    full_name: "Bob Tester",
    email: "test@studly.com",
    bio: "Some bio",
  },
];

describe("FindFriends Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (userInfo as any).mockReturnValue({ userId: "123" });
  });

  it("renders 'no users found' message when results is empty", () => {
    (useLoaderData as any).mockReturnValue({
      data: { friendsList: { data: { friends: [] } } },
    });

    render(<FindFriends results={[]} onClear={() => {}} />);

    expect(screen.getByText(/no users/i)).toBeDefined();
  });

  it("renders user search results", () => {
    (useLoaderData as any).mockReturnValue({
      data: { friendsList: { data: { friends: [] } } },
    });

    render(<FindFriends results={RESULTS} onClear={() => {}} />);

    expect(screen.getByText("Bob Tester")).toBeDefined();
    expect(screen.getByText("Some bio")).toBeDefined();
  });

  it("shows Add Friend button when user is not already a friend", () => {
    (useLoaderData as any).mockReturnValue({
      data: { friendsList: { data: { friends: FRIENDS } } },
    });

    render(<FindFriends results={RESULTS} onClear={() => {}} />);

    // IconUserPlus button is rendered
    const addButton = screen.getByRole("button");
    expect(addButton).toBeDefined();
  });

  it("submits form with correct userId + requestUserId", () => {
    const mockSubmit = vi.fn();
    (useSubmit as any).mockReturnValue(mockSubmit);

    (useLoaderData as any).mockReturnValue({
      data: { friendsList: { data: { friends: [] } } },
    });

    render(<FindFriends results={RESULTS} onClear={() => {}} />);

    const addButton = screen.getByRole("button");

    fireEvent.click(addButton);

    const button = screen.getByRole("button", { name: "" }); // your submit button
    fireEvent.click(button);

    expect(mockSubmit).toHaveBeenCalledTimes(2);

    const formData = mockSubmit.mock.calls[0][0] as FormData;

    expect(formData.get("userId")).toBe("123");
    expect(formData.get("requestUserId")).toBe("2");
  });
});
