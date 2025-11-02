import { ActionFunctionArgs, redirect } from "react-router-dom";
import { signUp } from "~/api";

export async function SignUpAction({ request }: ActionFunctionArgs) {
  let formdata = await request.formData();
  const fullname = formdata.get("name")?.toString();
  const email = formdata.get("email")?.toString();
  const password = formdata.get("password")?.toString();
  console.log(fullname + " " + email + " " + password);
  if (fullname && email && password) {
    const res = await signUp(email, password, fullname);
    if (!res.error) {
      console.log("data " + res.data);
      return redirect("/study");
    } else if (res.data) {
      console.log("error " + JSON.stringify(res.error));
      return (await res.data).json();
    }
  }
}
