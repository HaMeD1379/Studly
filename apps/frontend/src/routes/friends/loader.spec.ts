import { describe, it, expect, vi, beforeEach } from "vitest";
import { loader } from "./loader";
import * as api from "~/api";
import type { FriendsList, FriendCount, findUserProfile } from "~/types";

// Correct mock for FriendsList
const mockFriendsList = {
  user_id: "u1", // if FriendsList requires user_id
  friends: [
    { id: "f1", from_user: "u1", to_user: "u2", status: 1, updated_at: "2025-11-26" }
  ],
};



const mockPendingList: FriendsList = {
  user_id: "u1",
  friends: [
    { id: "f2", from_user: "u3", to_user: "u4", status: 0, updated_at: "2025-11-26T00:00:00Z" },
  ],
};

const mockFriendCount: FriendCount = { user_id: "u1", count: 10 };
const mockRequestCount: FriendCount = { user_id: "u1", count: 5 };

// Profile mock
const mockProfile = { data: { full_name: "Alice", email: "alice@test.com", bio: "Bio" } };

// Mock API
vi.mock("~/api", async () => ({
  getAllFriends: vi.fn(),
  viewFriendRequests: vi.fn(),
  getFriendsCount: vi.fn(),
  getFriendRequestCount: vi.fn(),
  findUserById: vi.fn(),
}));

describe("loader", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("loads friends and request profiles correctly", async () => {
  (api.getAllFriends as any).mockResolvedValue({
  data: { data: mockFriendsList },
  error: false,
});
  (api.viewFriendRequests as any).mockResolvedValue({ data: mockPendingList, error: false });
  (api.getFriendsCount as any).mockResolvedValue({ data: mockFriendCount, error: false });
  (api.getFriendRequestCount as any).mockResolvedValue({ data: mockRequestCount, error: false });
  (api.findUserById as any).mockResolvedValue(mockProfile);

  const result = await loader();

  expect(result.error).toBe(false); // should pass now
  expect(result.data.friendCount).toEqual(mockFriendCount);
  expect(result.data.requestCount).toEqual(mockRequestCount);
  expect(result.data.friendsProfile?.[0]).toEqual({ id: "f1", profile: mockProfile.data });
  expect(result.data.requestProfile?.[0]).toEqual({ id: "f2", profile: mockProfile.data });
});

  it("handles API errors", async () => {
    (api.getAllFriends as any).mockResolvedValue({ data: undefined, error: { message: "Failed", status: 500 } });
    (api.viewFriendRequests as any).mockResolvedValue({ data: undefined, error: { message: "Failed", status: 500 } });
    (api.getFriendsCount as any).mockResolvedValue({ data: undefined, error: { message: "Failed", status: 500 } });
    (api.getFriendRequestCount as any).mockResolvedValue({ data: undefined, error: { message: "Failed", status: 500 } });
    (api.findUserById as any).mockResolvedValue({ data: null });

    const result = await loader();

    expect(result.error).toBe(true);
    expect(result.data.friendsList).toBeUndefined();
    expect(result.data.pendingFriendships).toBeUndefined();
    expect(result.data.friendsProfile).toEqual([]);
    expect(result.data.requestProfile).toEqual([]);
  });
});