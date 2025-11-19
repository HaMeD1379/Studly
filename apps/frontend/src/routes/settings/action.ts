import { type ActionFunctionArgs, redirect } from 'react-router';
import { updateBio } from '~/api';
import { PROFILE } from '~/constants';
import { userInfoStore } from '~/store';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const bio = formData.get('bio')?.toString();
  const fullName = formData.get('fullName')?.toString();
  const token = localStorage.getItem('accessToken');

  const { userId, refreshToken } = userInfoStore.getState();
  if (!(bio || fullName) || !userId || !token || !refreshToken)
    return { error: 'Missing credentials' }; // early exit if missing

  const res = await updateBio(token, refreshToken, userId, fullName, bio);
  if (res.error) {
    return {
      message: `The HTTP request PATCH v1/profile/update failed with status ${res.error.status}`,
      success: false,
    };
  }

  if (!res.error && res.data) {
    return redirect(PROFILE);
  }
  return { error: 'Unexpected response from profile update' };
};
