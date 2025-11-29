import { type ActionFunctionArgs, redirect } from 'react-router';
import { updateBio } from '~/api';
import { PROFILE } from '~/constants';
import { userInfo } from '~/store';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const bio = formData.get('bio')?.toString();
  const fullName = formData.get('fullName')?.toString();

  const { accessToken, userId, refreshToken } = userInfo.getState();
  if (!(bio || fullName) || !userId || !accessToken || !refreshToken)
    return { error: 'Missing credentials' };

  const res = await updateBio(accessToken, refreshToken, userId, fullName, bio);
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
