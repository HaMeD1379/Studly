import { redirect } from 'react-router';
import { logout } from '~/api';
import { userInfoStore } from '~/store';

export const action = async () => {
  const token = localStorage.getItem('accessToken');
  const { setAccessStored, setCheckAccess } = userInfoStore.getState();
  if (token) {
    const res = await logout(token);

    if (res.error) {
      return res.error;
    }
    if (!res.error && res.data) {
      localStorage.removeItem('accessToken');
      setAccessStored(false);
      setCheckAccess();
      return redirect('/');
    }
  }
  return { error: 'Logout api call failed' };
};
