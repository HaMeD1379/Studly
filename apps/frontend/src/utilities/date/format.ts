export const formatISOToYYYYMMDD = (timestamp: string) => {
  const split = timestamp.split('T');

  return split?.length > 0 ? split[0] : timestamp;
};

export const getSunday = (date: Date) => {
  const d = new Date(date); // avoid mutating original
  const day = d.getDay(); // Sunday = 0

  // subtract day (0–6) to go back to Sunday
  d.setDate(d.getDate() - day);
  return d;
};
