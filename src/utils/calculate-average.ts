export const calculateAverage = (arrayOfNumber: number[]) => {
  const sum = arrayOfNumber.reduce((sum, value) => sum + value, 0);
  return sum / arrayOfNumber.length || 0;
};
