import { type ActionFunctionArgs, redirect } from 'react-router';
import { signUp } from '~/api';

export async function SignUpAction({ request }: ActionFunctionArgs) {
  const formdata = await request.formData();
  const fullname = formdata.get('name')?.toString();
  const email = formdata.get('email')?.toString();
  const password = formdata.get('password')?.toString();
  if (fullname && email && password) {
    const res = await signUp(email, password, fullname);
    if (!res.error) {
      return redirect('/study');
    } else if (res.data) {
      return (await res.data).json();
    }
  }
}
