export type Friends = {
  id: string;
  from_user: string;
  to_user: string;
  status: number;
  updated_at: string;
};

export type FriendCount = {
  user_id: string;
  count: number;
};

export type FriendsList = {
  user_id: string;
  friends: Friends[];
};

export type FriendsRequestResponse = {
  data: FriendsList;
  error?: {
    message: string;
    status: number;
  };
};

export type SentRequestResponse = {
  data: RequestResponse;
  error?: {
    message: string;
    status: number;
  };
};

export type FriendRequest = {
  id: string;
  from_user: string;
  to_user: string;
  status: number;
  updated_at: string;
};

export type Result = {
  user_id: string;
  email: string;
  full_name: string;
  bio: string;
};

type SearchFriends = {
  result: Result[];
  count: number;
};

export type SearchFriendsWrapper = {
  data: {
    data: SearchFriends;
  };
  message: string;
};

type SuccessfulSearchResponse = {
  data: SearchFriends;
  formtype: 'searchFriends';
  error?: undefined;
  message?: undefined;
};

type SuccessfulSendRequestResponse = {
  message: string;
  data: FriendRequest;
  formtype: 'sendFriendRequest';
  error?: undefined;
};

type ActionErrorResponse = {
  error: string;
  formtype?: string;
  data?: undefined;
  message?: undefined;
};

export type FriendsActionResponse =
  | SuccessfulSearchResponse
  | SuccessfulSendRequestResponse
  | ActionErrorResponse;

export type RequestResponse = {
  user_id: string;
  pending_requests: Friends[];
};

export type LoaderData = {
  data: {
    pendingFriendships: {
      friends: Result[];
    };
    requestProfile: RequestProfile[];
    receivedRequestsProfile: RequestProfile[];
  };
};

export type RequestProfile = {
  profile: {
    data: Result;
  };
};
