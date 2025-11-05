import { type ActionFunctionArgs, redirect } from 'react-router';
import { signUp } from '~/api';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formdata = await request.formData();
  const fullname = formdata.get('name')?.toString();
  const email = formdata.get('email')?.toString();
  const password = formdata.get('password')?.toString();
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

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('fullName', fullName);
      localStorage.setItem('email', email);
      localStorage.setItem('userId', userid);
      return redirect('/study');
    }
  }
};
