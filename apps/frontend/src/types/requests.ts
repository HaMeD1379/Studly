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
  data?: Promise<Type>;
  error?: RequestError;
};
