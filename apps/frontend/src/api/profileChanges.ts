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
  name?: string,
  bio?: string,
): Promise<RequestResolve<BackendLoginResponse>> =>
  await request(
    RequestMethods.PATCH,
    PROFILE_CHANGES_BIO,
    {
      Authorization: `Bearer ${token}`,
    },
    JSON.stringify({
      bio,
      full_name: name,
      refresh_token: refreshToken,
      user_id: userId,
    }),
  );

export const fetchBio = async (userId: string) => {
  const path = `${RETRIEVE_BIO}/${userId}`;
  return <RequestResolve<profileBio>>request(RequestMethods.GET, path);
};
