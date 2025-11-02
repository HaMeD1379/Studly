import { logout } from "~/api";
import { ActionFunctionArgs, redirect } from "react-router";

export async function logoutAction({ request }: ActionFunctionArgs) {
  const token = localStorage.getItem("accessToken");
  console.log("token:" + token);
  if (token) {
    const res = await logout(token);

    if (res.error) {
      console.log("Logout error:", res.error);
      return res.error;
    }
    console.log("called");
    if (!res.error && res.data) {
      console.log("called");
      localStorage.removeItem("accessToken");
      return redirect("/");
    } else {
      if (!res.data) console.log("!res data error");
      console.log("No valid token found");
      return { error: res.error };
    }
  }
  return { error: "Login api call failed" };
}
