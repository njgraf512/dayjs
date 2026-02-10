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

    it('should handle adding 0 business days', () => {
      const monday = dayjs('2025-01-06')
      const result = monday.addBusinessDays(0)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should handle negative days by subtracting', () => {
      const friday = dayjs('2025-01-10')
      const result = friday.addBusinessDays(-1)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-09')
    })

    it('should skip holidays when adding business days', () => {
      dayjs.setHolidays(['2025-01-07']) // Tuesday is a holiday
      const monday = dayjs('2025-01-06')
      const result = monday.addBusinessDays(1)
      // Should skip Tuesday (holiday) and land on Wednesday
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-08')
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

    it('should handle subtracting 0 business days', () => {
      const monday = dayjs('2025-01-06')
      const result = monday.subtractBusinessDays(0)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should handle negative days by adding', () => {
      const monday = dayjs('2025-01-06')
      const result = monday.subtractBusinessDays(-1)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-07')
    })

    it('should skip holidays when subtracting business days', () => {
      dayjs.setHolidays(['2025-01-09']) // Thursday is a holiday
      const friday = dayjs('2025-01-10')
      const result = friday.subtractBusinessDays(1)
      // Should skip Thursday (holiday) and land on Wednesday
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-08')
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

    it('should return negative count when end is before start', () => {
      const start = dayjs('2025-01-10') // Friday
      const end = dayjs('2025-01-06') // Monday
      expect(start.businessDaysUntil(end)).toBe(-4)
    })

    it('should return 0 for same date', () => {
      const date = dayjs('2025-01-06')
      expect(date.businessDaysUntil(date)).toBe(0)
    })

    it('should skip weekends when counting', () => {
      const start = dayjs('2025-01-03') // Friday
      const end = dayjs('2025-01-06') // Monday
      expect(start.businessDaysUntil(end)).toBe(1)
    })

    it('should respect holidays when counting', () => {
      dayjs.setHolidays(['2025-01-07', '2025-01-08']) // Tuesday and Wednesday
      const start = dayjs('2025-01-06') // Monday
      const end = dayjs('2025-01-10') // Friday
      expect(start.businessDaysUntil(end)).toBe(2) // Only Thursday and Friday
    })
  })

  describe('businessDaysInMonth', () => {
    it('should return all business days in a month', () => {
      const date = dayjs('2025-01-15') // Mid-January
      const bizDays = date.businessDaysInMonth()
      // January 2025 has 23 business days
      expect(bizDays.length).toBe(23)
    })

    it('should exclude holidays from business days in month', () => {
      dayjs.setHolidays(['2025-01-06', '2025-01-07']) // Monday and Tuesday
      const date = dayjs('2025-01-15')
      const bizDays = date.businessDaysInMonth()
      // January 2025 has 23 business days minus 2 holidays
      expect(bizDays.length).toBe(21)
    })
  })

  describe('nextBusinessDay', () => {
    it('should return next business day from weekday', () => {
      const monday = dayjs('2025-01-06')
      const result = monday.nextBusinessDay()
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-07')
    })

    it('should skip weekend', () => {
      const fri = dayjs('2025-01-03') // Friday
      const result = fri.nextBusinessDay()
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-06') // Monday
    })
  })

  describe('prevBusinessDay', () => {
    it('should return previous business day from weekday', () => {
      const tuesday = dayjs('2025-01-07')
      const result = tuesday.prevBusinessDay()
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should skip weekend', () => {
      const mon = dayjs('2025-01-06') // Monday
      const result = mon.prevBusinessDay()
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-03') // Friday
    })
  })

  describe('holidays', () => {
    it('should exclude holidays from business days', () => {
      dayjs.setHolidays(['2025-01-06']) // Monday is a holiday
      expect(dayjs('2025-01-06').isBusinessDay()).toBe(false)
      dayjs.setHolidays([]) // reset
    })

    it('should accept various date formats', () => {
      dayjs.setHolidays([
        '2025-01-06',
        dayjs('2025-01-07')
      ])
      expect(dayjs('2025-01-06').isBusinessDay()).toBe(false)
      expect(dayjs('2025-01-07').isBusinessDay()).toBe(false)
    })

    it('should allow retrieving holidays', () => {
      dayjs.setHolidays(['2025-01-06', '2025-01-07'])
      const holidays = dayjs.getHolidays()
      expect(holidays).toEqual(['2025-01-06', '2025-01-07'])
    })
  })
})
