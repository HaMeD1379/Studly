import { badgeColors } from '~/constants/profile';

export const randomColour = () => {
  return badgeColors[Math.floor(Math.random() * badgeColors.length)];
};
