import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder = '검색...', className }: SearchInputProps) {
  return (
    <div className={cn('relative min-w-0 flex-1', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}
