import { notifications } from "@mantine/notifications";

export function equalPasswords(password_1: string, password_2: string): boolean {
  if (password_1 && password_2) {
    if (password_1 === password_2) {
      return true;
    } else {
      notifications.show({
        title: "Mismatch",
        message: "The passwords do not match",
        color: "red",
      });
      return false;
    }
  }
  return false;
}