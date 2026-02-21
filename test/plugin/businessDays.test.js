import dayjs from '../../src'
import businessDays from '../../src/plugin/businessDays'

dayjs.extend(businessDays)

describe('BusinessDays Plugin', () => {
  describe('addBusinessDays', () => {
    it('should add business days skipping weekends', () => {
      // Friday Jan 3, 2025
      const friday = dayjs('2025-01-03')
      const result = friday.addBusinessDays(1)
      // Should be Monday Jan 6
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should handle adding multiple business days', () => {
      // Monday Jan 6, 2025
      const monday = dayjs('2025-01-06')
      const result = monday.addBusinessDays(5)
      // Should be next Monday Jan 13
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-13')
    })

    it('should throw TypeError for non-numeric input', () => {
      const date = dayjs('2025-01-06')
      expect(() => date.addBusinessDays('invalid')).toThrow(TypeError)
      expect(() => date.addBusinessDays(NaN)).toThrow(TypeError)
    })

    it('should throw RangeError for negative input', () => {
      const date = dayjs('2025-01-06')
      expect(() => date.addBusinessDays(-5)).toThrow(RangeError)
    })
  })

  describe('subtractBusinessDays', () => {
    it('should subtract business days skipping weekends', () => {
      // Monday Jan 6, 2025
      const monday = dayjs('2025-01-06')
      const result = monday.subtractBusinessDays(1)
      // Should be Friday Jan 3
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-03')
    })

    it('should throw TypeError for non-numeric input', () => {
      const date = dayjs('2025-01-06')
      expect(() => date.subtractBusinessDays('invalid')).toThrow(TypeError)
      expect(() => date.subtractBusinessDays(NaN)).toThrow(TypeError)
    })

    it('should throw RangeError for negative input', () => {
      const date = dayjs('2025-01-06')
      expect(() => date.subtractBusinessDays(-5)).toThrow(RangeError)
    })
  })

  describe('isBusinessDay', () => {
    it('should return true for weekdays', () => {
      expect(dayjs('2025-01-06').isBusinessDay()).toBe(true) // Monday
      expect(dayjs('2025-01-07').isBusinessDay()).toBe(true) // Tuesday
    })

    it('should return false for weekends', () => {
      expect(dayjs('2025-01-04').isBusinessDay()).toBe(false) // Saturday
      expect(dayjs('2025-01-05').isBusinessDay()).toBe(false) // Sunday
    })
  })

  describe('businessDaysUntil', () => {
    it('should count business days between two dates', () => {
      const start = dayjs('2025-01-06') // Monday
      const end = dayjs('2025-01-10')   // Friday
      expect(start.businessDaysUntil(end)).toBe(4)
    })
  })

  describe('holidays', () => {
    it('should exclude holidays from business days', () => {
      dayjs.setHolidays(['2025-01-06']) // Monday is a holiday
      expect(dayjs('2025-01-06').isBusinessDay()).toBe(false)
      dayjs.setHolidays([]) // reset
    })
  })
})
