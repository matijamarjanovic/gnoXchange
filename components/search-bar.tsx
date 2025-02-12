import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import { Card } from "./ui/card"

interface SearchBarProps {
  placeholder?: string
  onChange?: (value: string) => void
  className?: string
  containerClassName?: string
}

export function SearchBar({ 
  placeholder = "Search...", 
  onChange, 
  className = "",
  containerClassName = ""
}: SearchBarProps) {
  return (
    <Card className={cn(
      "p-2 bg-gray-800 text-gray-400 border-none shadow-lg",
      containerClassName
    )}>
      <div className={cn(
        "flex items-center gap-2",
        className
      )}>
        <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
        />
      </div>
    </Card>
  )
} 
