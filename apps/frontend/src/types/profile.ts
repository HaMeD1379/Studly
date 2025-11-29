type UserMetadata = {
  userId: string;
  bio: string;
};

export type ProfileBio = {
  message: string;
  data: UserMetadata;
};

export type subjectSummaries = {
  subject: string;
  totalMinutesStudied: number;
  sessionsLogged: number;
};

export type findUserProfile = {
  id: string;
  profile: profile;
  friendsSince?: string;
};

export type profile = {
  full_name: string;
  email: string;
  bio: string;
};
