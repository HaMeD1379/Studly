export const formatISOToYYYYMMDD = (timestamp: string) => {
  const split = timestamp.split('T');

  return split?.length > 0 ? split[0] : timestamp;
};
