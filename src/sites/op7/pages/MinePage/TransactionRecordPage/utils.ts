export function formatNumber(num: number) {
  // 确保输入是数字类型
  const number = Number(num);
  if (isNaN(number)) return '0.00';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always', // 总是显示正负号
  }).format(number);
}
