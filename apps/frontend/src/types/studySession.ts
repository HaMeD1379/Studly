export type StudySession = {
  subject: string;
  sessionLength: number;
  endStudyTimestamp: number;
};

export type TodaysStudyStatistics = {
  totalTimeStudied: number;
  timesStudied: number;
};
