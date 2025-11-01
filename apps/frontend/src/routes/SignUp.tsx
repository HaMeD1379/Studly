import { SignUpForm } from '~/components';

// TODO: Change once ready to implement
/*export const signUpLoader = async () => {
  const res = await signUp();

  // TODO: Change this example
  if (!res.error) {
    console.log('data ' + res.data);
  } else if (res.data) {
    console.log('error ' + JSON.stringify(res.error))
    return (await res.data).json();
  }
  return false;
}*/

export const SignUp = () => {
	return <SignUpForm />;
};
