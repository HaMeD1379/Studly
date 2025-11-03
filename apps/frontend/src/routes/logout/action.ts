import { redirect } from 'react-router';
import { logout } from '~/api';

export async function logoutAction() {
  const token = localStorage.getItem('accessToken');
  if (token) {
    const res = await logout(token);

    if (res.error) {
      return res.error;
    }
    if (!res.error && res.data) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('email');
      localStorage.removeItem('userId');
      localStorage.removeItem('fullName');
      return redirect('/');
    } else {
      return { error: res.error };
    }
  }
  return { error: 'Logout api call failed' };
}
