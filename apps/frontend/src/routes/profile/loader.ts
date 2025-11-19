import { fetchBio, SessionSummary } from '~/api';
import { userInfo } from '~/store';
import type { ProfileBio, TodaysStudyStatistics } from '~/types';

type StudyLoader = {
  data: {
    sessionSummary?: TodaysStudyStatistics;
    profileBio?: ProfileBio;
  };
  error: boolean;
};

export const loader = async (): Promise<StudyLoader> => {
  const { userId } = userInfo.getState();

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
