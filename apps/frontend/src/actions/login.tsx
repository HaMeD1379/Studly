import { login } from "~/api";
import { ActionFunctionArgs, redirect } from "react-router";

export async function loginAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email")!.toString();
  const password = formData.get("password")!.toString();

  if (!email || !password) return { error: "Missing credentials" }; // early exit if missing
  console.log("email:", email, "password:", password);
  const res = await login(email, password);
  console.log("mock response:", res);

  if (res.error) {
    console.log("Login error:", res.error);
    return res.error;
  }

  if (!res.error && res.data) {
    const accessToken = res.data.data.session.access_token;
    console.log("Access token:", accessToken);

    localStorage.setItem("accessToken", accessToken);
    console.log("Redirecting to /study");
    return redirect("/study");
  }
  console.log("Returning undefined");
  return { error: "Unexpected response from login" };
}
