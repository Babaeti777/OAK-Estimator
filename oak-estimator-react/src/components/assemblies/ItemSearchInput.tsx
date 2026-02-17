/**
 * Item Search Input (Autocomplete)
 *
 * A description input that searches the assembly database as the user types.
 * When a result is selected, it auto-fills unitCost, unit, type, and division.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { searchItems, type SearchableItem } from '@/data/item-search'
import { formatCurrency } from '@/lib/utils'

interface ItemSearchInputProps {
  value: string
  onChange: (value: string) => void
  onSelectItem?: (item: SearchableItem) => void
  placeholder?: string
  className?: string
}

export function ItemSearchInput({
  value,
  onChange,
  onSelectItem,
  placeholder = 'Search or type description...',
  className,
}: ItemSearchInputProps) {
  const [results, setResults] = useState<SearchableItem[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const skipSearchRef = useRef(false)

  // Search as user types
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      onChange(newValue)

      if (skipSearchRef.current) {
        skipSearchRef.current = false
        return
      }

      if (newValue.trim().length >= 2) {
        const matches = searchItems(newValue, 8)
        setResults(matches)
        setShowDropdown(matches.length > 0)
        setHighlightedIndex(-1)
      } else {
        setResults([])
        setShowDropdown(false)
      }
    },
    [onChange]
  )

  // Handle selecting a result
  const handleSelect = useCallback(
    (item: SearchableItem) => {
      skipSearchRef.current = true
      onChange(item.description)
      setShowDropdown(false)
      setResults([])
      onSelectItem?.(item)
      inputRef.current?.blur()
    },
    [onChange, onSelectItem]
  )

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown || results.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex(prev =>
            prev < results.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : results.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (highlightedIndex >= 0 && highlightedIndex < results.length) {
            handleSelect(results[highlightedIndex])
          }
          break
        case 'Escape':
          setShowDropdown(false)
          break
      }
    },
    [showDropdown, results, highlightedIndex, handleSelect]
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reopen dropdown on focus if there are results
  const handleFocus = useCallback(() => {
    if (value.trim().length >= 2) {
      const matches = searchItems(value, 8)
      if (matches.length > 0) {
        setResults(matches)
        setShowDropdown(true)
      }
    }
  }, [value])

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-y-auto">
          {results.map((item, index) => (
            <button
              key={`${item.description}-${index}`}
              type="button"
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                index === highlightedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              } ${index > 0 ? 'border-t border-border/50' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(item)
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">{item.description}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatCurrency(item.unitCost)}/{item.unit}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary capitalize">
                  {item.type}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Div {item.division}
                </span>
                {item.notes && (
                  <span className="text-[10px] text-muted-foreground truncate">
                    {item.notes}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
