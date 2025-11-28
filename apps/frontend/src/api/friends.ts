import {
  ALL_FRIENDS,
  FRIENDS_COUNT,
  PROFILE_INFO,
  RECEIVED_FRIEND_REQUEST,
  REQUEST_ACCEPTED_STATUS,
  REQUEST_PENDING_STATUS,
  SEND_FRIEND_REQUEST,
  UPDATE_FRIEND_REQUEST,
} from '~/constants';
import { userInfo } from '~/store';
import { RequestMethods, type SearchFriendsWrapper } from '~/types';
import type {
  FriendCount,
  FriendRequest,
  FriendsRequestResponse,
  SentRequestResponse,
} from '~/types/friends';
import { request } from '~/utilities/requests';

export const getFriendsCount = async () => {
  const { userId } = userInfo.getState();

  const path = `${FRIENDS_COUNT}/${userId}?status=${REQUEST_ACCEPTED_STATUS}`;

  const result = await request<FriendCount>(RequestMethods.GET, path);

  return result;
};

export const getFriendRequestCount = async () => {
  const { userId } = userInfo.getState();

  const path = `${FRIENDS_COUNT}/${userId}?status=${REQUEST_PENDING_STATUS}`;

  const result = await request<FriendCount>(RequestMethods.GET, path);

  return result;
};

export const getAllFriends = async () => {
  const { userId } = userInfo.getState();
  if (!userId) throw new Error('User ID is missing');

  const path = `${ALL_FRIENDS}/${userId}?status=${REQUEST_ACCEPTED_STATUS}`;
  const result = await request<FriendsRequestResponse>(
    RequestMethods.GET,
    path,
  );
  return result;
};

export const viewFriendRequests = async () => {
  const { userId } = userInfo.getState();
  if (!userId) throw new Error('User ID is missing');

  const path = `${ALL_FRIENDS}/${userId}?status=${REQUEST_PENDING_STATUS}`;
  const result = await request<FriendsRequestResponse>(
    RequestMethods.GET,
    path,
  );
  return result;
};

export const searchFriends = async (userName: string) => {
  const path = `${PROFILE_INFO}?str=${userName}`;

  const result = await request<SearchFriendsWrapper>(RequestMethods.GET, path);
  return result;
};

export const sendFriendRequest = async (
  userId: string,
  friendUserId: string,
) => {
  const path = `${SEND_FRIEND_REQUEST}`;
  const result = await request<FriendRequest>(
    RequestMethods.POST,
    path,
    undefined,
    JSON.stringify({ from_user: userId, to_user: friendUserId }),
  );
  return result;
};

export const receivedFriendRequest = async (userId: string) => {
  const path = `${RECEIVED_FRIEND_REQUEST}/${userId}`;
  const result = await request<SentRequestResponse>(RequestMethods.GET, path);
  return result;
};

export const updateFriendRequest = async (
  from_user: string,
  to_user: string,
  status: number,
) => {
  const path = `${UPDATE_FRIEND_REQUEST}`;
  const result = await request<FriendRequest>(
    RequestMethods.PATCH,
    path,
    undefined,
    JSON.stringify({ from_user: from_user, status: status, to_user: to_user }),
  );
  return result;
};
