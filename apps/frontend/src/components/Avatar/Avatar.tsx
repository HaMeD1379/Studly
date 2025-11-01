import type React from 'react';

type AvatarProps = {
  name: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
};

export const Avatar = ({
  name,
  size = 40,
  backgroundColor = '#007bff',
  textColor = '#ffffff',
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
    fontSize: size / 2, // Adjust font size relative to avatar size
    fontWeight: 'bold',
    height: size,
    justifyContent: 'center',
    width: size,
  };

  return <div style={avatarStyle}>{initials}</div>;
};
