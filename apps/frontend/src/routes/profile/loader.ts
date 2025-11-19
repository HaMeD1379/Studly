import { fetchBio } from '~/api';
import { userInfo } from '~/store';
import type { ProfileBio } from '~/types';

export const loader = async (): Promise<ProfileBio> => {
  const { userId } = userInfo.getState();
  if (userId) {
    const res = await fetchBio(userId);
    if (res.data) {
      return res.data;
    }
  }
  return {
    data: {
      bio: '',
      userId: `${userId}`,
    },
    message: 'Error in loader',
  };
};
