import dayjs from '../../src'
import businessDays from '../../src/plugin/businessDays'

dayjs.extend(businessDays)

describe('BusinessDays Plugin', () => {
  beforeEach(() => {
    // Reset holidays before each test to ensure test isolation
    dayjs.setHolidays([])
  })

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

    it('should handle adding zero business days', () => {
      const monday = dayjs('2025-01-06')
      const result = monday.addBusinessDays(0)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should handle negative business days', () => {
      const monday = dayjs('2025-01-06')
      const result = monday.addBusinessDays(-1)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-03')
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

    it('should handle subtracting zero business days', () => {
      const monday = dayjs('2025-01-06')
      const result = monday.subtractBusinessDays(0)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should handle negative business days', () => {
      const friday = dayjs('2025-01-03')
      const result = friday.subtractBusinessDays(-1)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-06')
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

    it('should return negative count when end is before start', () => {
      const start = dayjs('2025-01-10') // Friday
      const end = dayjs('2025-01-06')   // Monday
      expect(start.businessDaysUntil(end)).toBe(-4)
    })

    it('should return 0 for the same date', () => {
      const date = dayjs('2025-01-06')
      expect(date.businessDaysUntil(date)).toBe(0)
    })
  })

  describe('holidays', () => {
    it('should exclude holidays from business days', () => {
      dayjs.setHolidays(['2025-01-06']) // Monday is a holiday
      expect(dayjs('2025-01-06').isBusinessDay()).toBe(false)
    })

    it('should skip holidays when adding business days', () => {
      dayjs.setHolidays(['2025-01-06']) // Monday Jan 6 is a holiday
      const friday = dayjs('2025-01-03')
      const result = friday.addBusinessDays(1)
      // Should skip holiday Monday and go to Tuesday Jan 7
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-07')
    })

    it('should getHolidays correctly', () => {
      dayjs.setHolidays(['2025-01-06', '2025-12-25'])
      const holidays = dayjs.getHolidays()
      expect(holidays).toEqual(['2025-01-06', '2025-12-25'])
    })
  })
})
