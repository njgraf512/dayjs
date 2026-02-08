import dayjs from '../../src'
import businessDays from '../../src/plugin/businessDays'

dayjs.extend(businessDays)

describe('BusinessDays Plugin', () => {
  beforeEach(() => {
    // Reset holidays before each test
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

    it('should handle zero days', () => {
      const date = dayjs('2025-01-06')
      const result = date.addBusinessDays(0)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should handle negative days', () => {
      const monday = dayjs('2025-01-06')
      const result = monday.addBusinessDays(-1)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-03')
    })

    it('should skip holidays', () => {
      dayjs.setHolidays(['2025-01-06'])
      const friday = dayjs('2025-01-03')
      const result = friday.addBusinessDays(1)
      // Should be Tuesday Jan 7 (skipping holiday Monday)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-07')
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

    it('should handle zero days', () => {
      const date = dayjs('2025-01-06')
      const result = date.subtractBusinessDays(0)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should handle negative days', () => {
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
      const end = dayjs('2025-01-10') // Friday
      expect(start.businessDaysUntil(end)).toBe(4)
    })

    it('should handle negative direction', () => {
      const start = dayjs('2025-01-10') // Friday
      const end = dayjs('2025-01-06') // Monday
      expect(start.businessDaysUntil(end)).toBe(-4)
    })

    it('should handle same date', () => {
      const date = dayjs('2025-01-06')
      expect(date.businessDaysUntil(date)).toBe(0)
    })

    it('should account for holidays', () => {
      dayjs.setHolidays(['2025-01-06'])
      const start = dayjs('2025-01-03') // Friday
      const end = dayjs('2025-01-08') // Wednesday
      // Should count: Tue(7), Wed(8) = 2 (not Mon 6 - holiday)
      expect(start.businessDaysUntil(end)).toBe(2)
    })
  })

  describe('businessDaysInMonth', () => {
    it('should return all business days in a month', () => {
      const date = dayjs('2025-01-15')
      const days = date.businessDaysInMonth()
      // January 2025 has 23 business days
      expect(days.length).toBe(23)
      // Check first and last business days
      expect(days[0].format('YYYY-MM-DD')).toBe('2025-01-01')
      expect(days[days.length - 1].format('YYYY-MM-DD')).toBe('2025-01-31')
    })

    it('should account for holidays', () => {
      dayjs.setHolidays(['2025-01-01', '2025-01-20'])
      const date = dayjs('2025-01-15')
      const days = date.businessDaysInMonth()
      // Should be 23 - 2 holidays = 21
      expect(days.length).toBe(21)
    })
  })

  describe('holidays', () => {
    it('should exclude holidays from business days', () => {
      dayjs.setHolidays(['2025-01-06']) // Monday is a holiday
      expect(dayjs('2025-01-06').isBusinessDay()).toBe(false)
    })

    it('should return holidays as array', () => {
      dayjs.setHolidays(['2025-01-01', '2025-12-25'])
      const holidays = dayjs.getHolidays()
      expect(holidays).toContain('2025-01-01')
      expect(holidays).toContain('2025-12-25')
      expect(holidays.length).toBe(2)
    })
  })
})
