import { notifications } from "@mantine/notifications";

export function equalPasswords(
  password_1: string,
  password_2: string,
  passwordLen = 8
): boolean {
  if (!password_1 || !password_2) return false;

  if (password_1 !== password_2) {
    notifications.show({
      title: "Mismatch",
      message: "Passwords do not match",
      color: "red",
    });
    return false;
  }

  if (!/[a-z]/.test(password_1)) {
    notifications.show({
      title: "Weak Password",
      message: "Password must contain a lowercase letter",
      color: "red",
    });
    return false;
  }

  if (!/[A-Z]/.test(password_1)) {
    notifications.show({
      title: "Weak Password",
      message: "Password must contain an uppercase letter",
      color: "red",
    });
    return false;
  }

  if (!/\d/.test(password_1)) {
    notifications.show({
      title: "Weak Password",
      message: "Password must contain a number",
      color: "red",
    });
    return false;
  }

  if (!/[@#$%^&*()\-_+=]/.test(password_1)) {
    notifications.show({
      title: "Weak Password",
      message: "Password must contain a special character",
      color: "red",
    });
    return false;
  }

  if (password_1.length < passwordLen) {
    notifications.show({
      title: "Weak Password",
      message: `Password must be longer than ${passwordLen} characters`,
      color: "red",
    });
    return false;
  }

  return true;
}