export const sampleFriend = {
  bio: 'Testing bio',
  email: 'jane@example.com',
  full_name: 'Jane Doe',
  user_id: 'friend1',
};

export const sampleData = {
  data: {
    pendingFriendships: { friends: [sampleFriend] },
    receivedRequestsProfile: [{ profile: { data: sampleFriend } }],
    requestProfile: [{ profile: { data: sampleFriend } }],
  },
};
