import { AUTH_FORGOTPASSWORD, AUTH_LOGIN,AUTH_LOGOUT,AUTH_SIGNUP} from "~/config";
import  { type BackendLoginResponse, RequestMethods, type RequestResolve } from '~/types';
import { request } from "~/utilities/requests";


export const signUp = async (email:string,password:string,full_name:string) => await request(RequestMethods.POST, AUTH_SIGNUP, undefined,JSON.stringify({
    email: email,
    full_name: full_name,
    password: password,
  })
 
);

export const login = async (email:string, password:string): Promise<RequestResolve<BackendLoginResponse>> => await request(RequestMethods.POST,AUTH_LOGIN,undefined,JSON.stringify({ email: email, password: password, }));

export const forgotPassword = async (email:string) => await request(RequestMethods.POST, AUTH_FORGOTPASSWORD,undefined,JSON.stringify({
    email: email
  }));

export const logout = async(token:string) => await request(RequestMethods.POST, AUTH_LOGOUT, {Authorization: `Bearer ${token}`,})
