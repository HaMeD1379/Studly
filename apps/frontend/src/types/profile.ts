type UserMetadata = {
  userId: string;
  bio: string;
};

export type ProfileBio = {
  message: string;
  data: UserMetadata;
};
