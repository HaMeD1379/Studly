import { request } from '~/utilities/requests';
import { FRIENDS_COUNT,REQUEST_PENDING_STATUS,ALL_FRIENDS,REQUEST_ACCEPTED_STATUS,PROFILE_INFO,SEND_FRIEND_REQUEST,RECEIVED_FRIEND_REQUEST } from '~/constants';
import { FriendCount, FriendRequest, FriendsRequestResponse,SentRequestResponse } from '~/types/friends';
import { userInfo } from '~/store';
import { RequestMethods, type SearchFriendsWrapper } from '~/types';

export const getFriendsCount = async () => {
    const { userId } = userInfo.getState();

  const path = `${FRIENDS_COUNT}/${userId}`;

  const result = await request<FriendCount>(RequestMethods.GET, path);

  return result;
}

export const getFriendRequestCount = async () => {
     const { userId } = userInfo.getState();

  const path = `${FRIENDS_COUNT}/${userId}?status=${REQUEST_PENDING_STATUS}`;

  const result = await request<FriendCount>(RequestMethods.GET, path);

  return result;
}

export const getAllFriends = async () => {
  const { userId } = userInfo.getState();
  if (!userId) throw new Error("User ID is missing");

  const path = `${ALL_FRIENDS}/${userId}?status=${REQUEST_ACCEPTED_STATUS}`;
  const result = await request<FriendsRequestResponse>(RequestMethods.GET, path);
  return result;
}

export const viewFriendRequests = async () => {
  const { userId } = userInfo.getState();
  if (!userId) throw new Error("User ID is missing");

  const path = `${ALL_FRIENDS}/${userId}?status=${REQUEST_PENDING_STATUS}`;
  const result = await request<FriendsRequestResponse>(RequestMethods.GET, path);
  console.log("this should be friend requests sent", result)
  return result;
}

export const searchFriends = async(userName: string) => {
  const path = `${PROFILE_INFO}?str=${userName}`;
  
  const result = await request<SearchFriendsWrapper>(RequestMethods.GET, path);
  return result;
}

export const sendFriendRequest = async(userId: string, friendUserId: string) => {
  const path = `${SEND_FRIEND_REQUEST}`
  const result = await request<FriendRequest>(RequestMethods.POST, path,undefined, JSON.stringify({from_user: userId, to_user:friendUserId}));
  console.log("sending request",result)
  return result;
}

export const receivedFriendRequest = async(userId: string) => {
  const path = `${RECEIVED_FRIEND_REQUEST}/${userId}`
  const result = await request<SentRequestResponse>(RequestMethods.GET, path);
  console.log("this should be the friend requests received",result)
  return result;
}