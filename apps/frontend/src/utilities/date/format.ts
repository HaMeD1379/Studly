export const formatToYYYYMMDD = (timestamp: number) => {
  const date = new Date(timestamp);
  const month = date.getMonth();

  return `${date.getFullYear()}-${month}-${date.getDay()}`
};