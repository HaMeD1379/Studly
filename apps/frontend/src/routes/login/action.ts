import { type ActionFunctionArgs, redirect } from 'react-router';
import { login } from '~/api';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

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

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('email', email);
    localStorage.setItem('userId', userid);
    return redirect('/study');
  }
  return { error: 'Unexpected response from login' };
};
