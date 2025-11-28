import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { FriendsHeader } from "./FriendsHeader";
import { render } from "~/utilities/testing";
import fetchPolyfill, { Request as RequestPolyfill } from "node-fetch";
import {
  FRIENDS_HEADER_DESCRIPTION,
  FRIENDS_SEARCHBAR_PLACEHOLDER,
  FRIENDS_TAB_FRIENDS,
  FRIENDS_TAB_REQUESTS,
  FRIENDS_CARD_ONLINE,
  FRIENDS_CARD_STUDYING,
  FRIENDS,
} from "~/constants";

//Lines 15 - 24 were provided through an online github repo (https://github.com/reduxjs/redux-toolkit/issues/4966#issuecomment-3115230061) as solution to the error:
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

// Spy for submit()
const submitSpy = vi.fn();

// Mock react-router hooks
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useSubmit: () => submitSpy,
  };
});

const mockLoaderData = {
  data: {
    friendCount: { data: { count: 4 } },
    requestCount: { data: { count: 2 } },
  },
};

function createTestRouter() {
  return createMemoryRouter([
    {
      path: "/",
      element: <FriendsHeader />,
      loader: () => mockLoaderData,
    },
  ]);
}

describe("FriendsHeader", () => {
  beforeEach(() => {
    submitSpy.mockClear();
  });

  it("renders header and description", () => {
    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("Friends header")).toHaveTextContent(
      FRIENDS_TAB_FRIENDS
    );

    expect(screen.getByText(FRIENDS_HEADER_DESCRIPTION)).toBeInTheDocument();
  });

  it("renders search input", () => {
    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    const input = screen.getByPlaceholderText(FRIENDS_SEARCHBAR_PLACEHOLDER);

    expect(input).toBeInTheDocument();
  });

  it("allows typing in search field", () => {
    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    const input = screen.getByPlaceholderText(
      FRIENDS_SEARCHBAR_PLACEHOLDER
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "Alice" } });

    expect(input.value).toBe("Alice");
  });

  it("renders stats cards correctly", () => {
    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    const cards = [
      { label: FRIENDS_TAB_FRIENDS, value: "4" },
      { label: FRIENDS_TAB_REQUESTS, value: "2" },
      { label: FRIENDS_CARD_ONLINE, value: "2" },
      { label: FRIENDS_CARD_STUDYING, value: "1" },
    ];

    cards.forEach(({ label, value }) => {
      const testId = `${label.toLowerCase().replace(/\s+/g, "-")}-card`;
      const card = screen.getByTestId(testId);

      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent(label);
      expect(card).toHaveTextContent(value);
    });
  });

  it("calls submit() after debounce", async () => {
    const router = createTestRouter();
    render(<RouterProvider router={router} />);

    const input = screen.getByPlaceholderText(
      FRIENDS_SEARCHBAR_PLACEHOLDER
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "Alice" } });

    await waitFor(
      () => {
        expect(submitSpy).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });
});
