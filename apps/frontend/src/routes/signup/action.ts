import { type ActionFunctionArgs, redirect } from 'react-router';
import { signUp } from '~/api';
import { STUDY } from '~/constants';
import { userInfo } from '~/store/userInfo';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formdata = await request.formData();
  const fullname = formdata.get('name')?.toString();
  const email = formdata.get('email')?.toString();
  const password = formdata.get('password')?.toString();
  const { setAccessToken, setEmail, setName, setId, setRefreshToken } =
    userInfo.getState();
  if (fullname && email && password) {
    const res = await signUp(email, password, fullname);
    if (res.error) {
      return res.error;
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
      return redirect(STUDY);
    }
  }
};
