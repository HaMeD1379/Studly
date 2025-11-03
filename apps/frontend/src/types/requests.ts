export enum RequestMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

type RequestError = {
  status: number;
  message?: string;
};

export type RequestResolve<T = unknown> = {
  data?: T;
  error?: RequestError;
};

type Session = {
  access_token: string;
};

export interface LoginResponse {
  session: Session;
  refreshToken?: string;
  user: UserMetadata;
}

type UserMetadata = {
  id: string;
  email: string;
  full_name: string;
};

export interface BackendLoginResponse {
  message: string;
  data: LoginResponse;
}
