export const formatISOToYYYYMMDD = (timestamp: string) => {
  const split = timestamp.split('T');

  return split?.length > 0 ? split[0] : timestamp;
};

export const formatMinutesToHoursAndMinutes = (
  minutes: number,
  fullWords: boolean = false,
): string => {
  const actualMinutes = Math.floor(minutes % 60);
  const actualHours = Math.floor((minutes / 60) % 60);

  const hoursText = fullWords ? ` hour${actualHours > 1 ? 's' : ''}` : 'h';
  const minutesText = fullWords
    ? ` minute${actualMinutes > 1 ? 's' : ''}`
    : 'm';

  const formattedHours = actualHours > 0 ? `${actualHours}${hoursText}` : '';
  const formattedMinutes = `${actualMinutes}${minutesText}`;
  const space = actualHours > 0 ? ' ' : '';

  return `${formattedHours}${space}${formattedMinutes}`;
};

export const getSunday = (date: Date) => {
  const d = new Date(date); // avoid mutating original
  const day = d.getDay(); // Sunday = 0

  // subtract day (0–6) to go back to Sunday
  d.setDate(d.getDate() - day);
  return d;
};

export const hoursAndMinutes = (timeLen: number) => {
  let minute: string = '';
  let hours: string = '';
  if (timeLen < 0) throw new Error('Invalid time length');
  if (timeLen > 60) {
    hours = Math.floor(timeLen / 60).toString();
    minute = (timeLen % 60).toString();
    if (hours !== '1' && hours !== '0') {
      return `${`${hours} hours ${minute} minutes`}`;
    }
    return `${`${hours} hour ${minute} minutes`}`;
  }
  minute = timeLen.toString();
  return `${`${minute}m`}`;
};

export const toLocalISOString = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds())
  );
};

export const formatDateString = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};
