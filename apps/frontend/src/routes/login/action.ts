import { type ActionFunctionArgs, redirect } from 'react-router';
import { login } from '~/api';
import { AVATAR_ONLINE, STUDY } from '~/constants';
import { userInfo } from '~/store/userInfo';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const {
    setAccessToken,
    setEmail,
    setName,
    setId,
    setRefreshToken,
    setAvatarState,
  } = userInfo.getState();

  if (!email || !password) return { error: 'Missing credentials' }; // early exit if missing
  const res = await login(email, password);

  if (res.error) {
    return {
      message: `The HTTP request POST auth/login failed with status ${res.error.status}`,
      success: false,
    };
  }

  if (!res.error && res.data) {
    const accessToken = res.data.data.session.access_token;
    const fullName = res.data.data.user.full_name;
    const email = res.data.data.user.email;
    const userid = res.data.data.user.id;
    const refreshToken = res.data.data.session.refresh_token;
    setAccessToken(accessToken);
    setEmail(email);
    setName(fullName);
    setId(userid);
    setRefreshToken(refreshToken);
    setAvatarState(AVATAR_ONLINE);
    return redirect(STUDY);
  }
  return { error: 'Unexpected response from login' };
};
