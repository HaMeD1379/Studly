import { IconCircleFilled, IconUserPlus, IconUsers } from '@tabler/icons-react';
import {
  FRIENDS_CARD_ONLINE,
  FRIENDS_CARD_STUDYING,
  FRIENDS_TAB_FRIENDS,
  FRIENDS_TAB_REQUESTS,
  FRIENDS_TAB_SUGGESTIONS,
} from '~/constants/strings';

export const friendsTabs = [
  FRIENDS_TAB_FRIENDS,
  FRIENDS_TAB_REQUESTS,
  FRIENDS_TAB_SUGGESTIONS,
];

export const stats = [
  {
    icon: <IconUsers color='blue' size={28} />,
    label: FRIENDS_TAB_FRIENDS,
    value: '4',
  },
  {
    icon: <IconUserPlus color='#40c057' size={28} />,
    label: FRIENDS_TAB_REQUESTS,
    value: '2',
  },
  {
    icon: <IconCircleFilled color='#40c057' size={28} />,
    label: FRIENDS_CARD_ONLINE,
    value: '2',
  },
  {
    icon: <IconCircleFilled color='blue' size={28} />,
    label: FRIENDS_CARD_STUDYING,
    value: '1',
  },
];
