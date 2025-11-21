import type React from 'react';

type AvatarProps = {
  name: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  status?: 'online' | 'studying' | 'offline';
};

export const Avatar = ({
  name,
  size = 40,
  backgroundColor = '#007bff',
  textColor = '#ffffff',
  status = 'offline',
}: AvatarProps) => {
  const getInitials = (fullName: string): string => {
    const names = fullName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(
      0,
    )}`.toUpperCase();
  };

  const initials = getInitials(name);

  const avatarStyle: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor,
    borderRadius: '50%',
    color: textColor,
    display: 'flex',
    fontSize: size / 2,
    fontWeight: 'bold',
    height: size,
    justifyContent: 'center',
    position: 'relative',
    width: size,
  };
  const getStatusDot = () => {
    const commonStyle = {
      border: '2px solid white',
      borderRadius: '50%',
      bottom: 0,
      height: size * 0.28,
      position: 'absolute' as const,
      right: 0,
      width: size * 0.28,
    };

    if (status === 'online') {
      return (
        <span
          data-testid='status-dot'
          style={{ ...commonStyle, backgroundColor: '#40c057' }}
        />
      ); // green
    }

    if (status === 'studying') {
      return (
        <span
          data-testid='status-dot'
          style={{ ...commonStyle, backgroundColor: '#228be6' }}
        />
      ); // blue
    }

    return (
      <span
        data-testid='status-dot'
        style={{ ...commonStyle, backgroundColor: '#adb5bd' }}
      />
    ); // grey (offline)
  };

  return (
    <div data-testid='avatar' style={avatarStyle}>
      {initials}
      {getStatusDot()}
    </div>
  );
};
