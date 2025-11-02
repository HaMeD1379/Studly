import { logout } from "~/api";
import { type ActionFunctionArgs, redirect } from "react-router";

export async function logoutAction() {
  const token = localStorage.getItem("accessToken");
  if (token) {
    const res = await logout(token);

    if (res.error) {
      return res.error;
    }
    if (!res.error && res.data) {
      localStorage.removeItem("accessToken");
      return redirect("/");
    } else {
      return { error: res.error };
    }
  }
  return { error: "Login api call failed" };
}
