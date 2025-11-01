import type { StudySession, TodaysStudyStatistics } from './studySession';

export type StudyRoute = {
  error?: boolean;
  data: {
    summary?: TodaysStudyStatistics;
    sessionsList?: StudySession[];
  };
};
