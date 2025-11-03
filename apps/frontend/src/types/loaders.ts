import type { StudySession, TodaysStudyStatistics } from './studySession';

export type SessionSummaryLoader = TodaysStudyStatistics;

export type SessionListLoader = {
  sessions: StudySession[]
}