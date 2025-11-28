import {
  findUserById,
  getAllFriends,
  getFriendRequestCount,
  getFriendsCount,
  receivedFriendRequest,
  viewFriendRequests,
} from '~/api';
import { userInfo } from '~/store';
import type { findUserProfile } from '~/types';
import type {
  FriendCount,
  FriendsList,
  RequestResponse,
} from '~/types/friends';

type FriendsLoader = {
  data: {
    friendCount?: FriendCount;
    requestCount?: FriendCount;
    friendsList?: FriendsList;
    pendingFriendships?: FriendsList;
    friendsProfile?: findUserProfile[];
    requestProfile?: findUserProfile[];
    receivedRequestsProfile?: findUserProfile[];
    receivedRequests?: RequestResponse;
  };
  error: boolean;
};

const buildProfile = async (list: FriendsList): Promise<findUserProfile[]> => {
  return Promise.all(
    list.friends.map(async (entry) => {
      const friendId = entry.to_user;

      const profile = await findUserById(friendId);
      const safeProfile = profile.data ?? {
        bio: '',
        email: '',
        full_name: '',
      };
      const friendsSince = entry.updated_at;
      return {
        friendsSince: friendsSince,
        id: friendId,
        profile: safeProfile,
      };
    }),
  );
};

const rename = (list: RequestResponse): FriendsList => {
  for (let i = 0; i < list.pending_requests.length; i++) {
    const userId = list.pending_requests[i].from_user;
    list.pending_requests[i].from_user = list.pending_requests[i].to_user;
    list.pending_requests[i].to_user = userId;
  }
  return {
    friends: list.pending_requests,
    user_id: list.user_id,
  };
};

export const loader = async (): Promise<FriendsLoader> => {
  const { userId } = userInfo.getState();
  const [
    friendCount,
    requestCount,
    friendsList,
    pendingFriendships,
    receivedRequests,
  ] = await Promise.all([
    getFriendsCount(),
    getFriendRequestCount(),
    getAllFriends(),
    viewFriendRequests(),
    receivedFriendRequest(userId),
  ]);

  let friendsProfile: findUserProfile[] = [];
  let requestProfile: findUserProfile[] = [];
  let receivedRequestsProfile: findUserProfile[] = [];
  if (friendsList.data?.data) {
    friendsProfile = await buildProfile(friendsList.data.data);
  }
  if (pendingFriendships.data?.data) {
    requestProfile = await buildProfile(pendingFriendships.data.data);
  }
  if (receivedRequests.data?.data) {
    receivedRequestsProfile = await buildProfile(
      rename(receivedRequests.data.data),
    );
  }

  return {
    data: {
      friendCount: friendCount.data ?? undefined,
      friendsList: friendsList.data?.data ?? undefined,
      friendsProfile,
      pendingFriendships: pendingFriendships.data?.data ?? undefined,
      receivedRequests: receivedRequests.data?.data ?? undefined,
      receivedRequestsProfile,
      requestCount: requestCount.data ?? undefined,
      requestProfile,
    },
    error:
      !!friendCount.error ||
      !!requestCount.error ||
      !!friendsList.error ||
      !!pendingFriendships.error,
  };
};
