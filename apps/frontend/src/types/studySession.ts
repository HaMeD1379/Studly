export type StudySession = {
  subject: string;
  totalMinutes: number;
  endTime: string;
};

export type TodaysStudyStatistics = {
  totalMinutesStudied: number;
  sessionsLogged: number;
  subjectStudied?: [];
};

export type SessionSummaryLoader = TodaysStudyStatistics;

export type SessionListLoader = {
  sessions: StudySession[];
};
