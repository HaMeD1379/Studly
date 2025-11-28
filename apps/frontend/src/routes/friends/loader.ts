import {
  getAllFriends,
  getFriendRequestCount,
  getFriendsCount,
  viewFriendRequests,
  findUserById,
  receivedFriendRequest
} from "~/api";
import { findUserProfile } from "~/types";
import { FriendCount, RequestResponse, FriendsList } from "~/types/friends";
import { userInfo } from "~/store";
type FriendsLoader = {
  data: {
    friendCount?: FriendCount;
    requestCount?: FriendCount;
    friendsList?: FriendsList;
    pendingFriendships?: FriendsList;
    friendsProfile?:findUserProfile[]
    requestProfile?: findUserProfile[]
    receivedRequestsProfile?: findUserProfile[]
    receivedRequests?: RequestResponse;
  };
  error: boolean;
};

const {userId} = userInfo.getState()

const buildProfile = async (list: FriendsList): Promise<findUserProfile[]> => {
  
  return Promise.all(
    list.friends.map(async (entry) => {
      const friendId = entry.to_user;
      //if(type && type === "request" && friendId !== userId){
      
      const profile = await findUserById(friendId);
      const safeProfile = profile.data ?? {
        full_name: "",
        email: "",
        bio: "",
      };
      
    
      return {
        id: friendId,
        profile: safeProfile,
      };
    
    })
  );
};

const rename = (list: RequestResponse) : FriendsList => {
  return{
    user_id:list.user_id,
    friends: list.pending_requests
  }
}

export const loader = async (): Promise<FriendsLoader> => {
  const {userId} = userInfo.getState()
  const [friendCount, requestCount, friendsList, pendingFriendships, receivedRequests] =
    await Promise.all([
      getFriendsCount(),
      getFriendRequestCount(),
      getAllFriends(),
      viewFriendRequests(),
      receivedFriendRequest(userId)
    ]);

    let friendsProfile: findUserProfile[] = [];
    let requestProfile: findUserProfile[] = [];
    let receivedRequestsProfile: findUserProfile[] = [];
if (friendsList.data?.data) {
  friendsProfile = await buildProfile(friendsList.data.data);
}
    if(pendingFriendships.data?.data){
      console.log("request structure",pendingFriendships.data.data)
      requestProfile = await buildProfile(pendingFriendships.data.data);
    }
    if(receivedRequests.data?.data){
      console.log(receivedRequests.data.data)
      receivedRequestsProfile = await buildProfile(rename(receivedRequests.data.data))
    }
    

  return {
    data: {
      friendCount: friendCount.data ?? undefined,
      requestCount: requestCount.data ?? undefined,
      friendsList: friendsList.data?.data ?? undefined,
      pendingFriendships: pendingFriendships.data?.data ?? undefined,
      friendsProfile, 
      requestProfile,
      receivedRequestsProfile,
      receivedRequests: receivedRequests.data?.data ?? undefined
    },
    error:
      !!friendCount.error ||
      !!requestCount.error ||
      !!friendsList.error ||
      !!pendingFriendships.error,
  };
};