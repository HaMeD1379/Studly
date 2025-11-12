import { PROFILE_CHANGES_BIO } from '~/constants';
import {
  type BackendLoginResponse,
  RequestMethods,
  type RequestResolve,
} from '~/types';
import { request } from '~/utilities/requests';

//include checks for full_name and bio they could be empty strings
export const updateBio = async (
  token: string,
  refreshToken: string,
  userId: string,
  name_change?: string,
  bio_change?: string,
): Promise<RequestResolve<BackendLoginResponse>> =>
  await request(
    RequestMethods.PATCH,
    PROFILE_CHANGES_BIO,
    {
      Authorization: `Bearer ${token}`,
    },
    JSON.stringify({
      bio: bio_change,
      full_name: name_change,
      refresh_token: refreshToken,
      user_id: userId,
    }),
  );
