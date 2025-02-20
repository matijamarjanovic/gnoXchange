interface FormattedAmountProps {
  amount: string
  decimals?: number
  className?: string
}

export function FormattedAmount({ amount, decimals = 6, className = "" }: FormattedAmountProps) {
  const parts = amount.split('.');
  const wholePart = parts[0];
  const decimalPart = parts[1]?.padEnd(decimals, '0') || '0'.repeat(decimals);

  return (
    <span className={className}>
      {wholePart}
      <span className="text-gray-500 text-[0.8em]">.{decimalPart}</span>
    </span>
  );
} 
