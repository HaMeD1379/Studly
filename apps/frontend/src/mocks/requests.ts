export const successDataMock = {
  'success': 'true'
}

export const successRequestMock = {
  json: () => Promise.resolve(successDataMock),
  ok: true,
  status: 200
}

export const failureStatusMock = 400;

export const failureMessageMock = 'The HTTP request GET / failed with status 400';

export const failureRequestMock = {
  ok: false,
  status: 400
}
