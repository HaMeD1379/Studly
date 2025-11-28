import {
  AUTH_FORGOTPASSWORD,
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_SIGNUP,
  RETRIEVE_BIO
} from '~/constants';
import {
  type BackendLoginResponse,
  RequestMethods,
  type RequestResolve,
  UserMetadata,
  type userProfileInfo
} from '~/types';
import { request } from '~/utilities/requests';

export const signUp = async (
  email: string,
  password: string,
  full_name: string,
): Promise<RequestResolve<BackendLoginResponse>> =>
  await request(
    RequestMethods.POST,
    AUTH_SIGNUP,
    undefined,
    JSON.stringify({
      email: email,
      full_name: full_name,
      password: password,
    }),
  );

export const login = async (
  email: string,
  password: string,
): Promise<RequestResolve<BackendLoginResponse>> =>
  await request(
    RequestMethods.POST,
    AUTH_LOGIN,
    undefined,
    JSON.stringify({ email: email, password: password }),
  );

export const forgotPassword = async (email: string) =>
  await request(
    RequestMethods.POST,
    AUTH_FORGOTPASSWORD,
    undefined,
    JSON.stringify({
      email: email,
    }),
  );

export const logout = async (token: string) => {
  return await request(RequestMethods.POST, AUTH_LOGOUT, {
    Authorization: `Bearer ${token}`,
  });
};

export const getProfile = async (
  userId: string
): Promise<RequestResolve<userProfileInfo>> => {

  const path = `${RETRIEVE_BIO}/${userId}`;

  const res: RequestResolve<userProfileInfo> = await request(
    RequestMethods.GET,
    path
  );

  return res;
};
