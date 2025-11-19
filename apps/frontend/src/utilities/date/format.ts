export const formatToYYYYMMDD = (timestamp: number) => {
  const date = new Date(timestamp);

  return `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`;
};

export const getSunday = (date: Date) => {
  const d = new Date(date); // avoid mutating original
  const day = d.getDay();   // Sunday = 0

  // subtract day (0–6) to go back to Sunday
  d.setDate(d.getDate() - day);
  return d;
};