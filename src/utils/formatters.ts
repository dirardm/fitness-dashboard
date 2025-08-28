export const formatNumber = (value: number | null | undefined, decimals: number = 1): string => {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return 'N/A';
  }
  return value.toFixed(decimals);
};

export const formatBPM = (value: number | null | undefined): string => {
  const formatted = formatNumber(value, 0);
  return formatted === 'N/A' ? 'N/A' : `${formatted} BPM`;
};

export const formatHours = (value: number | null | undefined): string => {
  const formatted = formatNumber(value, 1);
  return formatted === 'N/A' ? 'N/A' : `${formatted} hrs`;
};

export const formatPercentage = (value: number | null | undefined): string => {
  const formatted = formatNumber(value, 1);
  return formatted === 'N/A' ? 'N/A' : `${formatted}%`;
};
