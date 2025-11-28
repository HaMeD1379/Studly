import { fetchSessionsList, fetchTodaysSessionSummary } from '~/api';
import type { StudySession, TodaysStudyStatistics } from '~/types';

type StudyLoader = {
  data: {
    sessionsList?: StudySession[];
    summary?: TodaysStudyStatistics;
  };
  error: boolean;
};

export const loader = async (): Promise<StudyLoader> => {
  const [summary, sessionsList] = await Promise.all([
    fetchTodaysSessionSummary(),
    fetchSessionsList(),
  ]);

  return {
    data: {
      sessionsList: sessionsList.data?.sessions ?? undefined,
      summary: summary.data ?? undefined,
    },
    error: !!(summary.error || sessionsList.error),
  };
};
