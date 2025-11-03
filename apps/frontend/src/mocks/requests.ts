export const mockSuccessData = {
  success: 'true',
};

export const mockSuccessRequest = {
  json: () => Promise.resolve(mockSuccessData),
  ok: true,
  status: 200,
};

export const mockFailureStatus = 400;

export const mockFailureMessage =
  'The HTTP request GET / failed with status 400';

export const mockFailureRequest = {
  ok: false,
  status: 400,
};
