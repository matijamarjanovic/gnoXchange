import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  pageSize?: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  className?: string
  variant?: "default" | "minimal"
}

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className = "",
  variant = "default"
}: PaginationControlsProps) {
  const pageSizeOptions = Array.from({ length: 10 }, (_, i) => (i + 1) * 5)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="bg-gray-800 hover:bg-gray-900 text-gray-400 hover:text-gray-400"
      >
        Previous
      </Button>
      <span className="text-gray-400">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="ghost"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="bg-gray-800 hover:bg-gray-900 text-gray-400 hover:text-gray-400"
      >
        Next
      </Button>
      {variant === "default" && onPageSizeChange && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="bg-gray-800 hover:bg-gray-900 hover:text-gray-400 h-9">
              {pageSize} per page <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 border-none">
            {pageSizeOptions.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => onPageSizeChange(size)}
                className="text-gray-400 hover:text-gray-900"
              >
                {size} tickets
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
} 
