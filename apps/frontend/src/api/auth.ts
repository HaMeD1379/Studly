import { AUTH_SIGNUP } from '~/constants';
import { RequestMethods } from '~/types';
import { request } from '~/utilities/requests';

export const signUp = async () =>
  await request(
    RequestMethods.POST,
    AUTH_SIGNUP,
    undefined,
    `
    {
      "email": "shivbhagat@icloud.com",
      "password": "Shiv@1234",
      "full_name": "Shiv Bhagat"
    }
  `,
  );
