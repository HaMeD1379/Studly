type UserMetadata = {
  userId: string;
  bio: string;
};

export type ProfileBio = {
  message: string;
  data: UserMetadata;
};

export type subjectSummaries = {
  subject:string;
  totalMinutesStudied: number;
  sessionsLogged: number
}