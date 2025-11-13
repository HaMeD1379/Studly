import { fetchBio } from '~/api';
import type { profileBio } from '~/types';

export const loader = async (): Promise<profileBio> => {
  const user_id = localStorage.getItem('userId')?.toString();
  if (user_id) {
    const res = await fetchBio(user_id);
    if (res.data) {
      return res.data;
    }
  }
  return {
    data: {
      bio: '',
      user_id: `${user_id}`,
    },
    message: 'Error in loader',
  };
};
