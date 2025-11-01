export const formatToYYYYMMDD = (timestamp: number) => {
	const date = new Date(timestamp);

	return `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`;
};
