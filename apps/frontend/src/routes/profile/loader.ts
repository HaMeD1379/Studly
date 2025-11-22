import { fetchAllTimeSummary, fetchBio, fetchWeeklySessionSummary } from '~/api';
import { userInfo } from '~/store';
import type { ProfileBio, StudySession, TodaysStudyStatistics } from '~/types';

type StudyLoader = {
  data: {
    sessionSummary?: TodaysStudyStatistics;
    profileBio?: ProfileBio;
    sessions?: StudySession[];
  };
  error: boolean;
};

export const loader = async (): Promise<StudyLoader> => {
  const { userId } = userInfo.getState();

  const [sessionSummary, profileBio, sessionsList] = await Promise.all([
    await fetchWeeklySessionSummary(),
    await fetchBio(userId),
    await fetchAllTimeSummary(),
  ]);

  return {
    data: {
      profileBio: profileBio.data ?? undefined,
      sessionSummary: sessionSummary.data ?? undefined,
      sessions: sessionsList.data?.sessions ?? undefined,
    },
    error: !!(sessionSummary.error || profileBio.error),
  };
};
