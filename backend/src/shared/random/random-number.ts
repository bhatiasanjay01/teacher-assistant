export function generateRandom7DigitNumber(): number {
  const min = 1000000; // 最小的7位数是1000000
  const max = 9999999; // 最大的7位数是9999999
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
