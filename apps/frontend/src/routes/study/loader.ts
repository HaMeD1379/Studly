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
    await fetchTodaysSessionSummary(),
    await fetchSessionsList(),
  ]);

  return {
    data: {
      sessionsList: (await sessionsList.data)?.sessions ?? undefined,
      summary: (await summary.data) ?? undefined,
    },
    error: !!(summary.error || sessionsList.error),
  };
};
