/**
 * UnitSelect — a dropdown for picking construction units with
 * optional automatic quantity/cost conversion when switching
 * between compatible units.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { Select } from '@/components/ui/select'
import { UNITS, normalizeUnit, convertUnit, type ConversionResult } from '@/data/units'

interface UnitSelectProps {
  value: string
  onChange: (unit: string) => void
  /** Called when user accepts a conversion — receives converted qty + cost. */
  onConvert?: (result: ConversionResult) => void
  /** Current quantity — needed to calculate conversion preview. */
  quantity?: number
  /** Current unit cost — needed to calculate conversion preview. */
  unitCost?: number
  className?: string
  id?: string
  'aria-label'?: string
}

export function UnitSelect({
  value,
  onChange,
  onConvert,
  quantity = 0,
  unitCost = 0,
  className,
  id,
  'aria-label': ariaLabel,
}: UnitSelectProps) {
  const [conversionOffer, setConversionOffer] = useState<{
    toUnit: string
    result: ConversionResult
  } | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Normalise current value for display.
  const normalised = normalizeUnit(value)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newUnit = e.target.value
      onChange(newUnit)

      // Check if we can offer a conversion.
      if (onConvert) {
        const result = convertUnit(value, newUnit, quantity, unitCost)
        if (result) {
          setConversionOffer({ toUnit: newUnit, result })
          return
        }
      }
      setConversionOffer(null)
    },
    [onChange, onConvert, value, quantity, unitCost],
  )

  const acceptConversion = useCallback(() => {
    if (conversionOffer && onConvert) {
      onConvert(conversionOffer.result)
    }
    setConversionOffer(null)
  }, [conversionOffer, onConvert])

  const dismissConversion = useCallback(() => {
    setConversionOffer(null)
  }, [])

  // Dismiss if user clicks outside.
  useEffect(() => {
    if (!conversionOffer) return
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setConversionOffer(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [conversionOffer])

  // Build grouped options.
  const categories = Array.from(new Set(UNITS.map(u => u.category)))

  return (
    <div ref={wrapperRef} className="relative">
      <Select
        value={normalised}
        onChange={handleChange}
        className={className}
        id={id}
        aria-label={ariaLabel}
      >
        {categories.map(cat => (
          <optgroup key={cat} label={cat}>
            {UNITS.filter(u => u.category === cat).map(u => (
              <option key={u.value} value={u.value}>
                {u.value}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>

      {/* Conversion offer popover */}
      {conversionOffer && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-popover border border-border rounded-md shadow-lg p-2 min-w-[220px]">
          <p className="text-xs text-muted-foreground mb-1.5">
            Convert quantity &amp; cost?
          </p>
          <p className="text-xs font-medium mb-2">
            {quantity} → {+conversionOffer.result.newQuantity.toFixed(4)}{' '}
            <span className="text-muted-foreground">
              (×{+conversionOffer.result.factor.toFixed(6)})
            </span>
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={acceptConversion}
              className="flex-1 text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Convert
            </button>
            <button
              type="button"
              onClick={dismissConversion}
              className="flex-1 text-xs px-2 py-1 rounded border border-border hover:bg-muted transition-colors"
            >
              Keep values
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
