import { displayNotifications } from '~/utilities/notifications';

export function equalPasswords(
  password_1: string,
  password_2: string,
  passwordLen = 8,
): boolean {
  if (!password_1 || !password_2) return false;

  return (
    matchingPasswords(password_1, password_2) &&
    lowercaseCheck(password_1) &&
    uppercaseCheck(password_1) &&
    containsNumber(password_1) &&
    containsSpecialCharacter(password_1) &&
    checkPasswordLength(password_1, passwordLen)
  );
}

const matchingPasswords = (password_1: string, password_2: string) => {
  if (password_1 !== password_2) {
    displayNotifications('Mismatch', 'Passwords do not match', 'red');
    return false;
  }
  return true;
};

const lowercaseCheck = (password_1: string) => {
  if (!/[a-z]/.test(password_1)) {
    displayNotifications(
      'Weak Password',
      'Password must contain a lowercase letter',
      'red',
    );
    return false;
  }
  return true;
};

const uppercaseCheck = (password_1: string) => {
  if (!/[A-Z]/.test(password_1)) {
    displayNotifications(
      'Weak Password',
      'Password must contain an uppercase letter',
      'red',
    );
    return false;
  }
  return true;
};

const containsNumber = (password_1: string) => {
  if (!/\d/.test(password_1)) {
    displayNotifications(
      'Weak Password',
      'Password must contain a number',
      'red',
    );
    return false;
  }
  return true;
};

const containsSpecialCharacter = (password_1: string) => {
  if (!/[@#$%^&*()\-_+=]/.test(password_1)) {
    displayNotifications(
      'Weak Password',
      'Password must contain a special character',
      'red',
    );
    return false;
  }
  return true;
};

const checkPasswordLength = (password_1: string, passwordLen: number) => {
  if (password_1.length < passwordLen) {
    displayNotifications(
      'Weak Password',
      `Password must be longer than ${passwordLen} characters`,
      'red',
    );
    return false;
  }
  return true;
};
//open close
//single responsibility
