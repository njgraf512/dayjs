import dayjs from '../../src'
import businessDays from '../../src/plugin/businessDays'

dayjs.extend(businessDays)

afterEach(() => {
  dayjs.setHolidays([])
})

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

    it('should add 0 business days and return same date', () => {
      const monday = dayjs('2025-01-06')
      expect(monday.addBusinessDays(0).format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should skip holidays when adding business days', () => {
      dayjs.setHolidays(['2025-01-06']) // Monday Jan 6 is a holiday
      const friday = dayjs('2025-01-03')
      // 1 business day after Friday, skipping the holiday Monday, should be Tuesday Jan 7
      expect(friday.addBusinessDays(1).format('YYYY-MM-DD')).toBe('2025-01-07')
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

    it('should subtract 0 business days and return same date', () => {
      const monday = dayjs('2025-01-06')
      expect(monday.subtractBusinessDays(0).format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should skip holidays when subtracting business days', () => {
      dayjs.setHolidays(['2025-01-03']) // Friday Jan 3 is a holiday
      const monday = dayjs('2025-01-06')
      // 1 business day before Monday, skipping the holiday Friday, should be Thursday Jan 2
      expect(monday.subtractBusinessDays(1).format('YYYY-MM-DD')).toBe('2025-01-02')
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

  describe('nextBusinessDay', () => {
    it('should return the next business day', () => {
      // Friday Jan 3 -> Monday Jan 6
      expect(dayjs('2025-01-03').nextBusinessDay().format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should return the next non-holiday business day', () => {
      dayjs.setHolidays(['2025-01-06']) // Monday is a holiday
      // Friday Jan 3 -> Tuesday Jan 7 (skipping holiday Monday)
      expect(dayjs('2025-01-03').nextBusinessDay().format('YYYY-MM-DD')).toBe('2025-01-07')
    })
  })

  describe('prevBusinessDay', () => {
    it('should return the previous business day', () => {
      // Monday Jan 6 -> Friday Jan 3
      expect(dayjs('2025-01-06').prevBusinessDay().format('YYYY-MM-DD')).toBe('2025-01-03')
    })

    it('should return the previous non-holiday business day', () => {
      dayjs.setHolidays(['2025-01-03']) // Friday Jan 3 is a holiday
      // Monday Jan 6 -> Thursday Jan 2 (skipping holiday Friday)
      expect(dayjs('2025-01-06').prevBusinessDay().format('YYYY-MM-DD')).toBe('2025-01-02')
    })
  })

  describe('businessDaysUntil', () => {
    it('should count business days between two dates', () => {
      const start = dayjs('2025-01-06') // Monday
      const end = dayjs('2025-01-10')   // Friday
      expect(start.businessDaysUntil(end)).toBe(4)
    })

    it('should return a negative count when end is before start', () => {
      const start = dayjs('2025-01-10') // Friday
      const end = dayjs('2025-01-06')   // Monday
      expect(start.businessDaysUntil(end)).toBe(-4)
    })

    it('should return 0 when start and end are the same day', () => {
      const date = dayjs('2025-01-06')
      expect(date.businessDaysUntil(date)).toBe(0)
    })

    it('should exclude holidays from the count', () => {
      dayjs.setHolidays(['2025-01-08']) // Wednesday Jan 8 is a holiday
      const start = dayjs('2025-01-06') // Monday
      const end = dayjs('2025-01-10')   // Friday
      expect(start.businessDaysUntil(end)).toBe(3) // Tue, Thu, Fri (Wed is holiday)
    })
  })

  describe('businessDaysInMonth', () => {
    it('should return all business days in a month', () => {
      // January 2025 has 23 business days
      const days = dayjs('2025-01-15').businessDaysInMonth()
      expect(days).toHaveLength(23)
      expect(days[0].format('YYYY-MM-DD')).toBe('2025-01-01')
      expect(days[days.length - 1].format('YYYY-MM-DD')).toBe('2025-01-31')
    })

    it('should exclude holidays from business days in month', () => {
      dayjs.setHolidays(['2025-01-01', '2025-01-20']) // New Year's + MLK Day
      const days = dayjs('2025-01-15').businessDaysInMonth()
      expect(days).toHaveLength(21)
    })
  })

  describe('holidays', () => {
    it('should exclude holidays from isBusinessDay', () => {
      dayjs.setHolidays(['2025-01-06']) // Monday is a holiday
      expect(dayjs('2025-01-06').isBusinessDay()).toBe(false)
    })

    it('should restore business days after holidays are cleared', () => {
      dayjs.setHolidays(['2025-01-06'])
      expect(dayjs('2025-01-06').isBusinessDay()).toBe(false)
      dayjs.setHolidays([])
      expect(dayjs('2025-01-06').isBusinessDay()).toBe(true)
    })

    it('should return the current list of holidays via getHolidays', () => {
      dayjs.setHolidays(['2025-01-01', '2025-12-25'])
      const h = dayjs.getHolidays()
      expect(h).toEqual(['2025-01-01', '2025-12-25'])
    })
  })
})
