import React from "react";

interface AvatarProps {
  name: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 40,
  backgroundColor = "#007bff",
  textColor = "#ffffff",
}) => {
  const getInitials = (fullName: string): string => {
    const names = fullName.split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(
      0
    )}`.toUpperCase();
  };

  const initials = getInitials(name);

  const avatarStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    backgroundColor,
    color: textColor,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: size / 2, // Adjust font size relative to avatar size
    fontWeight: "bold",
  };

  return <div style={avatarStyle}>{initials}</div>;
};

export default Avatar;
