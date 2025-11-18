import { PROFILE_CHANGES_BIO, RETRIEVE_BIO } from '~/constants';
import {
  type BackendLoginResponse,
  type profileBio,
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

export const fetchBio = async (user_id: string) => {
  console.log('Fetch bio');
  const path = `${RETRIEVE_BIO}/${user_id}`;
  return <RequestResolve<profileBio>>request(RequestMethods.GET, path);
};
