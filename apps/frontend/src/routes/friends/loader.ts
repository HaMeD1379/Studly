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
  Friends,
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
      const friendId =
        list.user_id === entry.to_user ? entry.from_user : entry.to_user;

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
    const filterList: FriendsList = pendingFriendships.data.data;
    const userId = filterList.user_id;
    const friend: Friends[] = filterList.friends.filter(
      (entry) => userId === entry.from_user,
    );
    requestProfile = await buildProfile({ friends: friend, user_id: userId });
  }
  if (receivedRequests.data?.data) {
    const filterList: RequestResponse = receivedRequests.data.data;
    const userId = filterList.user_id;
    const friend: Friends[] = filterList.pending_requests.filter(
      (entry) => userId === entry.to_user,
    );
    receivedRequestsProfile = await buildProfile({
      friends: friend,
      user_id: userId,
    });
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
