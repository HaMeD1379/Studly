export type Friends = {
    id: string,
    from_user: string,
    to_user: string,
    status: number,
    updated_at: string
}


export type FriendCount = {
    user_id: string,
    count: number
}

export type FriendsList = {
     user_id : string,
    friends: Friends[]
}

export type FriendsApiResponse = {
  message: string;
  data: FriendsList;
};

// Request function wraps the API response in another `data` layer
export type FriendsRequestResponse = {
  data:FriendsList;
  error?: {
    message: string;
    status: number;
  };
};

export type SentRequestResponse = {
  data:RequestResponse;
  error?: {
    message: string;
    status: number;
  };
};

export type FriendRequest = {
    id: string,
    from_user: string,
    to_user: string,
    status: number,
    updated_at: string
}

export type Result={
    user_id: string,
email: string,
full_name: string,
bio: string
}

export type SearchFriends = {
    result: Result[]
    count: number
}

export type SearchFriendsWrapper = {
    data: {
        data: SearchFriends
    },
    message: string
}

export type SuccessfulSearchResponse = {
  data: SearchFriends;
  formtype: "searchFriends"; // MUST match the successful return value from action
  error?: undefined;
  message?: undefined;
};

export type SuccessfulSendRequestResponse = {
  message: string;
  data: FriendRequest;
  formtype: "sendFriendRequest";
  error?: undefined;
};

export type ActionErrorResponse = {
  error: string;
  // Make successful properties absent/undefined to distinguish this from success
  formtype?: string; 
  data?: undefined;
  message?: undefined;
};

export type FriendsActionResponse = 
  | SuccessfulSearchResponse
  | SuccessfulSendRequestResponse
  | ActionErrorResponse;

  export 
type RequestResponse = {
  user_id: string;
  pending_requests: Friends[]
}
