import { type ActionFunctionArgs, redirect } from 'react-router';
import { login } from '~/api';

export async function loginAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!email || !password) return { error: 'Missing credentials' }; // early exit if missing
  const res = await login(email, password);
  console.log('mock response:', res);

  if (res.error) {
    console.log('Login error:', res.error);
    return res.error;
  }

  if (!res.error && res.data) {
    const accessToken = res.data.data.session.access_token;
    const fullName = res.data.data.user.full_name;
    const email = res.data.data.user.email;
    const userid = res.data.data.user.id;
    console.log('Access token:', accessToken);

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('email', email);
    localStorage.setItem('userId', userid);
    console.log('Redirecting to /study');
    return redirect('/study');
  }
  console.log('Returning undefined');
  return { error: 'Unexpected response from login' };
}
