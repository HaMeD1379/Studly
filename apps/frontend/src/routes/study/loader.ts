import { fetchSessionsList, fetchTodaysSessionSummary } from '~/api/sessions';
import type { StudyRoute } from '~/types';

export const loader = async (): Promise<StudyRoute> => {
  const [summary, sessionsList] = await Promise.all([
    await fetchTodaysSessionSummary('test'),
    await fetchSessionsList('test'),
  ]);

  return {
    data: {
      sessionsList: (await sessionsList.data) ?? undefined,
      summary: (await summary.data) ?? undefined,
    },
    error: !!(summary.error || sessionsList.error),
  };
};
