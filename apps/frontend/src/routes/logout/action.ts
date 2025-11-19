import { redirect } from 'react-router';
import { logout } from '~/api';
import { LOGIN } from '~/constants';
import { userInfo } from '~/store';

export const action = async () => {
  const { accessToken, setAccessToken, setAccessStored, setCheckAccess } =
    userInfo.getState();
  if (accessToken) {
    const res = await logout(accessToken);

    if (res.error) {
      return res.error;
    }
    if (!res.error && res.data) {
      setAccessToken('');
      setAccessStored(false);
      setCheckAccess();
      return redirect(LOGIN);
    }
  }
  return { error: 'Logout api call failed' };
};
