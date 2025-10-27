import { supabase } from "./SupabaseClient";
const redirect = import.meta.env.VITE_FORGOT_PASSWORD_REDIRECT;

export async function signIn(email:string,password:string){
    const {data,error} = await supabase.auth.signInWithPassword({email,password});
    if(error) throw error;
    return data;
}

export async function signUp(email:string,password:string,name:string){
    const {data,error} = await supabase.auth.signUp({email,password,options:{data:{fullname:name}}})
    if (error) throw error;
    return data;
}

export async function signOut(){
    console.log("Sign Out");
    const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return true;
}

export async function ForgotPassword(email:string){
    const {data,error} = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: redirect,
})
if (error) {
    console.error("Supabase error:", error);
    throw error;
  }
  return data;
}

export async function passwordChange(password:string){
    await supabase.auth.updateUser({ password: password })
}