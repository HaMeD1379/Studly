import { fetchBio } from '~/api';
import { userInfoStore } from '~/store';
import type { profileBio } from '~/types';
export const loader = async (): Promise<profileBio> => {
  const { userId } = userInfoStore.getState();
  if (userId) {
    const res = await fetchBio(userId);
    if (res.data) {
      return res.data;
    }
  }
  return {
    data: {
      bio: '',
      user_id: `${userId}`,
    },
    message: 'Error in loader',
  };
};
