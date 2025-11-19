import { screen } from "@testing-library/react";
import fetchPolyfill, { Request as RequestPolyfill } from "node-fetch";
import { describe, expect, it, type Mock, vi } from "vitest";
import { UserProfile } from "~/routes";
import { render } from "~/utilities/testing";

const mockLoaderData = {
  data: {
    profileBio: { data: { bio: "This is my Bio" } },
    sessionSummary: { sessionsLogged: 0, totalMinutesStudied: 0 },
  },
  error: false,
};

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useLoaderData: () => mockLoaderData,
    useNavigate: () => mockNavigate,
  };
});

const mockSetName = vi.fn();
const mockSetEmail = vi.fn();
const mockSetId = vi.fn();
const mockSetRefreshToken = vi.fn();
const mockSetBio = vi.fn();

const mockStore = {
  bio: "This is my Bio",
  email: "testUser@gmail.com",
  name: "Test User",
  setBio: mockSetBio,
  setEmail: mockSetEmail,
  setId: mockSetId,
  setName: mockSetName,
  setRefreshToken: mockSetRefreshToken,
  userId: "1",
};

type MockZustandStore = Mock & {
  getState: () => typeof mockStore;
  setState: (newState: Partial<typeof mockStore>) => void;
};

vi.mock("~/store", () => {
  const store = vi.fn(() => mockStore) as MockZustandStore;
  store.getState = () => mockStore;
  store.setState = (newState: Partial<typeof mockStore>) =>
    Object.assign(mockStore, newState);
  return { userInfo: store };
});

//Lines 50- 57 were provided through an online github repo (https://github.com/reduxjs/redux-toolkit/issues/4966#issuecomment-3115230061) as solution to the error:
//RequestInit: Expected signal ("AbortSignal {}") to be an instance of AbortSignal.
Object.defineProperty(global, "fetch", {
  value: fetchPolyfill,
  writable: true,
});
Object.defineProperty(global, "Request", {
  value: RequestPolyfill,
  writable: false,
});
describe("UserProfile Tests", () => {
  it("renders all nested components", async () => {
    render(<UserProfile />);
    const name_field = await screen.findByTestId("name-text");
    const email_field = await screen.findByTestId("email-text");
    const bio_field = await screen.findByTestId("bio-text");
    const edit_btn = await screen.findByTestId("edit-btn");
    const share_btn = await screen.findByTestId("share-btn");
    const this_week = await screen.findByTestId("this-week-card");
    const subject_distribution = await screen.findByTestId(
      "subject-distribution-card"
    );
    const recent_badges = await screen.findByTestId("recent-badges-card");
    const day_streak = await screen.findByTestId("day-streak-card");
    const total_study = await screen.findByTestId("total-study-card");
    const badges = await screen.findByTestId("badges-card");
    const friends = await screen.findByTestId("friends-card");
    expect(name_field).toHaveTextContent("Test User");
    expect(email_field).toHaveTextContent("testUser@gmail.com");
    expect(bio_field).toHaveTextContent("This is my Bio");
    expect(edit_btn).toHaveTextContent("Edit");
    expect(share_btn).toHaveTextContent("Share");
    expect(this_week).toHaveTextContent("This Week");
    expect(subject_distribution).toHaveTextContent("Subject Distribution");
    expect(recent_badges).toHaveTextContent("Recent Badges");
    expect(day_streak).toHaveTextContent("Day Streak");
    expect(total_study).toHaveTextContent("Total Study");
    expect(badges).toHaveTextContent("Badges");
    expect(friends).toHaveTextContent("Friends");
  });
});
