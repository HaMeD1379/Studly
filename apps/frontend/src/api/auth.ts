import  { RequestResolve, RequestMethods, BackendLoginResponse } from '~/types';
import { request } from "~/utilities/requests";
import { AUTH_SIGNUP, AUTH_LOGIN,AUTH_FORGOTPASSWORD, AUTH_LOGOUT } from "~/config";

export const signUp = async (email:string,password:string,full_name:string) => await request(RequestMethods.POST, AUTH_SIGNUP, undefined,JSON.stringify({
    email: email,
    password: password,
    full_name: full_name,
  })
 
);

export const login = async (email:string, password:string): Promise<RequestResolve<BackendLoginResponse>> => await request(RequestMethods.POST,AUTH_LOGIN,undefined,JSON.stringify({ email: email, password: password, }));

export const forgotPassword = async (email:string) => await request(RequestMethods.POST, AUTH_FORGOTPASSWORD,undefined,JSON.stringify({
    email: email
  }));

export const logout = async(token:string) => await request(RequestMethods.POST, AUTH_LOGOUT, {Authorization: `Bearer ${token}`,})
