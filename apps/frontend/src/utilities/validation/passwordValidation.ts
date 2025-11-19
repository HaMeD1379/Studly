import { displayNotifications } from '~/utilities/notifications';

export const equalPasswords = (
  password1: string,
  password2: string,
  passwordLen = 8,
): boolean => {
  if (!password1 || !password2) return false;

  return (
    matchingPasswords(password1, password2) &&
    lowercaseCheck(password1) &&
    uppercaseCheck(password1) &&
    containsNumber(password1) &&
    containsSpecialCharacter(password1) &&
    checkPasswordLength(password1, passwordLen)
  );
};

const matchingPasswords = (password1: string, password2: string) => {
  if (password1 !== password2) {
    displayNotifications('Mismatch', 'Passwords do not match', 'red');
    return false;
  }
  return true;
};

const lowercaseCheck = (password1: string) => {
  if (!/[a-z]/.test(password1)) {
    displayNotifications(
      'Weak Password',
      'Password must contain a lowercase letter',
      'red',
    );
    return false;
  }
  return true;
};

const uppercaseCheck = (password1: string) => {
  if (!/[A-Z]/.test(password1)) {
    displayNotifications(
      'Weak Password',
      'Password must contain an uppercase letter',
      'red',
    );
    return false;
  }
  return true;
};

const containsNumber = (password1: string) => {
  if (!/\d/.test(password1)) {
    displayNotifications(
      'Weak Password',
      'Password must contain a number',
      'red',
    );
    return false;
  }
  return true;
};

const containsSpecialCharacter = (password1: string) => {
  if (!/[@#$%^&*()\-_+=]/.test(password1)) {
    displayNotifications(
      'Weak Password',
      'Password must contain a special character',
      'red',
    );
    return false;
  }
  return true;
};

const checkPasswordLength = (password1: string, passwordLen: number) => {
  if (password1.length < passwordLen) {
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
