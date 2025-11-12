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

export type RequestResolve<Type> = {
  data?: Type;
  error?: RequestError;
};

type Session = {
  access_token: string;
  refresh_token:string
};

export type LoginResponse = {
  session: Session;
  refreshToken?: string;
  user: UserMetadata;
};

type UserMetadata = {
  id: string;
  email: string;
  full_name: string;
};

export type BackendLoginResponse = {
  message: string;
  data: LoginResponse;
};
