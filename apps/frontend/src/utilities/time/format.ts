export const formatISOToYYYYMMDD = (timestamp: string) => {
  const split = timestamp.split('T');

  return split?.length > 0 ? split[0] : timestamp;
};

export const formatMinutesToHoursAndMinutes = (minutes: number): string => {
  const actualMinutes = Math.floor(minutes % 60);
  const actualHours = Math.floor((minutes / 60) % 60);

  const formattedHours = actualHours > 0 ? `${actualHours}h` : '';
  const formattedMinutes = `${actualMinutes}m`;
  const space = actualHours > 0 ? ' ' : '';

  return `${formattedHours}${space}${formattedMinutes}`;
};