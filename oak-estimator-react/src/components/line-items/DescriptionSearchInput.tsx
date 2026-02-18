/**
 * Description Search Input (Division-Linked Autocomplete)
 *
 * A description input that shows items from the materials database filtered
 * by the currently selected division. When an item is selected, it can
 * auto-fill type, unit, and unitCost.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { searchDivisionItems, getItemsForDivision, type DivisionItem } from '@/data/division-items'
import { formatCurrency } from '@/lib/utils'

interface DescriptionSearchInputProps {
  value: string
  division: string
  onChange: (value: string) => void
  onSelectItem?: (item: DivisionItem) => void
  placeholder?: string
  className?: string
}

export function DescriptionSearchInput({
  value,
  division,
  onChange,
  onSelectItem,
  placeholder = 'Search description...',
  className,
}: DescriptionSearchInputProps) {
  const [results, setResults] = useState<DivisionItem[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const skipSearchRef = useRef(false)

  // Search as user types, filtered by division
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      onChange(newValue)

      if (skipSearchRef.current) {
        skipSearchRef.current = false
        return
      }

      if (newValue.trim().length >= 1) {
        const matches = searchDivisionItems(division, newValue, 10)
        setResults(matches)
        setShowDropdown(matches.length > 0)
        setHighlightedIndex(-1)
      } else {
        // Show all items for the division when field is empty or very short
        const allItems = getItemsForDivision(division).slice(0, 10)
        setResults(allItems)
        setShowDropdown(allItems.length > 0)
        setHighlightedIndex(-1)
      }
    },
    [onChange, division]
  )

  // Handle selecting a result
  const handleSelect = useCallback(
    (item: DivisionItem) => {
      skipSearchRef.current = true
      onChange(item.description)
      setShowDropdown(false)
      setResults([])
      onSelectItem?.(item)
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
          setHighlightedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((prev) =>
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

  // Show dropdown on focus with all division items
  const handleFocus = useCallback(() => {
    if (value.trim().length >= 1) {
      const matches = searchDivisionItems(division, value, 10)
      if (matches.length > 0) {
        setResults(matches)
        setShowDropdown(true)
      }
    } else {
      const allItems = getItemsForDivision(division).slice(0, 10)
      if (allItems.length > 0) {
        setResults(allItems)
        setShowDropdown(true)
      }
    }
  }, [value, division])

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
        aria-label="Description"
      />

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-56 overflow-y-auto min-w-[280px]">
          {results.map((item, index) => (
            <button
              key={`${item.id}-${index}`}
              type="button"
              className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
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
                <span className="font-medium truncate text-xs">{item.description}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatCurrency(item.unitCost)}/{item.unit}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] px-1 py-0.5 rounded bg-secondary capitalize">
                  {item.type}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
