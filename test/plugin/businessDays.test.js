import dayjs from '../../src'
import businessDays from '../../src/plugin/businessDays'

dayjs.extend(businessDays)

describe('BusinessDays Plugin', () => {
  afterEach(() => {
    // Reset holidays after each test to avoid interference
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
      dayjs.setHolidays(['2025-01-07'])
      const monday = dayjs('2025-01-06')
      const result = monday.addBusinessDays(1)
      // Tuesday is a holiday, should be Wednesday
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
      dayjs.setHolidays(['2025-01-09']) // Thursday Jan 9
      const friday = dayjs('2025-01-10')
      const result = friday.subtractBusinessDays(1)
      // Thursday is a holiday, so previous business day is Wednesday
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
      const end = dayjs('2025-01-10')   // Friday
      expect(start.businessDaysUntil(end)).toBe(4)
    })

    it('should return negative count when end is before start', () => {
      const start = dayjs('2025-01-10') // Friday
      const end = dayjs('2025-01-06')   // Monday
      expect(start.businessDaysUntil(end)).toBe(-4)
    })

    it('should return 0 for same date', () => {
      const date = dayjs('2025-01-06')
      expect(date.businessDaysUntil(date)).toBe(0)
    })

    it('should exclude holidays when counting', () => {
      dayjs.setHolidays(['2025-01-07'])
      const start = dayjs('2025-01-06') // Monday
      const end = dayjs('2025-01-10')   // Friday
      // Mon, Tue(holiday), Wed, Thu = 3 days
      expect(start.businessDaysUntil(end)).toBe(3)
    })

    it('should handle string and Dayjs inputs', () => {
      const start = dayjs('2025-01-06')
      expect(start.businessDaysUntil('2025-01-10')).toBe(4)
      expect(start.businessDaysUntil(dayjs('2025-01-10'))).toBe(4)
    })
  })

  describe('businessDaysInMonth', () => {
    it('should return all business days in the month', () => {
      const date = dayjs('2025-01-15')
      const businessDays = date.businessDaysInMonth()
      // January 2025 has 23 business days
      expect(businessDays.length).toBe(23)
      // All should be business days
      businessDays.forEach(day => {
        expect(day.isBusinessDay()).toBe(true)
      })
    })

    it('should exclude holidays from month business days', () => {
      dayjs.setHolidays(['2025-01-06', '2025-01-20'])
      const date = dayjs('2025-01-15')
      const businessDays = date.businessDaysInMonth()
      // 23 - 2 holidays = 21 business days
      expect(businessDays.length).toBe(21)
    })
  })

  describe('nextBusinessDay', () => {
    it('should get next business day from weekday', () => {
      const monday = dayjs('2025-01-06')
      expect(monday.nextBusinessDay().format('YYYY-MM-DD')).toBe('2025-01-07')
    })

    it('should skip weekend', () => {
      const friday = dayjs('2025-01-03')
      expect(friday.nextBusinessDay().format('YYYY-MM-DD')).toBe('2025-01-06')
    })
  })

  describe('prevBusinessDay', () => {
    it('should get previous business day from weekday', () => {
      const tuesday = dayjs('2025-01-07')
      expect(tuesday.prevBusinessDay().format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should skip weekend', () => {
      const monday = dayjs('2025-01-06')
      expect(monday.prevBusinessDay().format('YYYY-MM-DD')).toBe('2025-01-03')
    })
  })

  describe('holidays', () => {
    it('should exclude holidays from business days', () => {
      dayjs.setHolidays(['2025-01-06']) // Monday is a holiday
      expect(dayjs('2025-01-06').isBusinessDay()).toBe(false)
    })

    it('should handle multiple holidays', () => {
      dayjs.setHolidays(['2025-01-06', '2025-01-07', '2025-01-08'])
      expect(dayjs('2025-01-06').isBusinessDay()).toBe(false)
      expect(dayjs('2025-01-07').isBusinessDay()).toBe(false)
      expect(dayjs('2025-01-08').isBusinessDay()).toBe(false)
      expect(dayjs('2025-01-09').isBusinessDay()).toBe(true)
    })

    it('should accept Dayjs and string formats', () => {
      dayjs.setHolidays([dayjs('2025-01-06'), '2025-01-07'])
      expect(dayjs('2025-01-06').isBusinessDay()).toBe(false)
      expect(dayjs('2025-01-07').isBusinessDay()).toBe(false)
    })

    it('should return holidays as array', () => {
      dayjs.setHolidays(['2025-01-06', '2025-01-07'])
      const holidays = dayjs.getHolidays()
      expect(Array.isArray(holidays)).toBe(true)
      expect(holidays.length).toBe(2)
    })
  })
})
