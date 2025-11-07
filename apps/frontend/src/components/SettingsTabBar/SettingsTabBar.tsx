import { Box, SegmentedControl, Text } from '@mantine/core';
import {
  IconBell,
  IconClock,
  IconPalette,
  IconShield,
  IconUser,
} from '@tabler/icons-react';
import { useState } from 'react';

export const SettingsTabBar = () => {
  const tabs = ['Profile', 'Notifications', 'Privacy', 'Study', 'Appearance'];
  const [value, setValue] = useState('profile');

  const loadIcon = (tab: string) => {
    switch (tab.toLowerCase()) {
      case 'profile':
        return <IconUser size={20} />;
      case 'notifications':
        return <IconBell size={20} />;
      case 'privacy':
        return <IconShield size={20} />;
      case 'study':
        return <IconClock size={20} />;
      case 'appearance':
        return <IconPalette size={20} />;
      default:
        return null;
    }
  };

  const isDisabled = value !== 'profile';

  return (
    <Box py='md' w='100%'>
      <h1>Settings</h1>
      <Text c='dimmed'>
        Manage your account settings and preferences. (Profile is the only tab
        accessible currently)
      </Text>

      <SegmentedControl
        data={tabs.map((t) => ({
          label: (
            <span
              style={{
                alignItems: 'center',
                display: 'flex',
                fontWeight: 'bold',
                gap: '6px',
                justifyContent: 'center',
              }}
            >
              {loadIcon(t)}
              {t}
            </span>
          ),
          value: t.toLowerCase(),
        }))}
        disabled={isDisabled}
        fullWidth
        onChange={(val) => {
          if (val === 'profile') setValue(val);
        }}
        radius='lg'
        size='lg'
        transitionDuration={200}
        value={value}
      />
    </Box>
  );
};
