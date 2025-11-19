import { fetchBio, SessionSummary } from '~/api';
import { userInfoStore } from '~/store';
import type { profileBio, TodaysStudyStatistics } from '~/types';

type StudyLoader = {
  data: {
    sessionSummary?: TodaysStudyStatistics;
    profileBio?: profileBio;
  };
  error: boolean;
};

export const loader = async (): Promise<StudyLoader> => {
  const { userId } = userInfoStore.getState();

  const [sessionSummary, profileBio] = await Promise.all([
    await SessionSummary(),
    await fetchBio(userId),
  ]);

  return {
    data: {
      profileBio: profileBio.data ?? undefined,
      sessionSummary: sessionSummary.data ?? undefined,
    },
    error: !!(sessionSummary.error || profileBio.error),
  };
};
