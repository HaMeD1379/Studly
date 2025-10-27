import { displayNotifications } from "~/utilities/notifications";

//StackOverflow: https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
export function validateEmail(email: string): boolean {

  return validEmailFormat(email);
}

const validEmailFormat = (email: string) => {
  if (
    email
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  ) {
    return true;
  }displayNotifications("Mismatch","Provide a valid Email","red");
  return false;
}