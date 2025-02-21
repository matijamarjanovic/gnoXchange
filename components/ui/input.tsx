import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { spacing?: number }>(
  ({ className, type, onChange, value, spacing = 3, ...props }, ref) => {
    const formatNumber = (value: string) => {
      const cleanValue = value.replace(/[^\d.]/g, '')
      
      const [integerPart, decimalPart] = cleanValue.split('.')
      
      const regex = new RegExp(`\\B(?=(\\d{${spacing}})+(?!\\d))`, 'g')
      const formattedInteger = integerPart.replace(regex, ' ')
      
      return decimalPart !== undefined 
        ? `${formattedInteger}.${decimalPart}`
        : formattedInteger
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === 'number') {
        const formattedValue = formatNumber(e.target.value)
        e.target.value = formattedValue
        onChange?.(e)
      } else {
        onChange?.(e)
      }
    }

    return (
      <input
        type={type === 'number' ? 'text' : type}
        className={cn(
          "flex h-10 w-full rounded-md bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          className
        )}
        onChange={handleChange}
        value={type === 'number' ? formatNumber(String(value)) : value}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
