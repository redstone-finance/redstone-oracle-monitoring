export const calculateAverage = (arrayOfNumber: number[]) => {
  const sum = arrayOfNumber.reduce((sum, value) => sum + value, 0);
  return sum / arrayOfNumber.length || 0;
};

export const calculateMedian = (arrayOfNumber: number[]) => {
  if (arrayOfNumber.length === 0) {
    throw Error("Cannot calculate median on empty array");
  }
  const sorted = arrayOfNumber.sort(
    (leftNumber, rightNumber) => leftNumber - rightNumber
  );
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
};
