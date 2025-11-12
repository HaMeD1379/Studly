import { type ActionFunctionArgs, redirect } from 'react-router';
import { updateBio } from '~/api';

export const action = async ({ request }: ActionFunctionArgs) => {
    console.log("called\n")
  const formData = await request.formData();
  const bio = formData.get('bio')?.toString();
  const fullName = formData.get('fullName')?.toString()
const userId = localStorage.getItem("userId")
const token = localStorage.getItem('accessToken')
const refreshToken = localStorage.getItem('refreshToken')
console.log(`bio is ${bio}`)
  if (!(bio || fullName) || !userId ||!token || !refreshToken) return { error: 'Missing credentials' }; // early exit if missing
  
  const res = await updateBio(token,refreshToken,userId,fullName,bio);
    console.log("nothings missing\n")
  if (res.error) {
    return {
      message: `The HTTP request PATCH v1/profile/update failed with status ${res.error.status}`,
      success: false,
    };
  }

  if (!res.error && res.data) {
    return redirect('/user-profile');
  }
  return { error: 'Unexpected response from profile update' };
};
