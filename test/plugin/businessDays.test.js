import dayjs from '../../src'
import businessDays from '../../src/plugin/businessDays'

dayjs.extend(businessDays)

// Reset holidays after every test so a failing assertion cannot leak state
// into subsequent tests (setHolidays([]) on the last line of each test
// is never reached when the preceding expect() throws).
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

    it('should skip holidays when adding business days', () => {
      dayjs.setHolidays(['2025-01-06']) // Monday Jan 6 is a holiday
      // Friday Jan 3 + 1 business day should skip the holiday Monday and land on Tuesday Jan 7
      expect(dayjs('2025-01-03').addBusinessDays(1).format('YYYY-MM-DD')).toBe('2025-01-07')
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

    it('should skip holidays when subtracting business days', () => {
      dayjs.setHolidays(['2025-01-03']) // Friday Jan 3 is a holiday
      // Monday Jan 6 - 1 business day: Sat/Sun skipped, Fri Jan 3 is a holiday → Thu Jan 2
      expect(dayjs('2025-01-06').subtractBusinessDays(1).format('YYYY-MM-DD')).toBe('2025-01-02')
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
    it('should return the next business day from a weekday', () => {
      expect(dayjs('2025-01-06').nextBusinessDay().format('YYYY-MM-DD')).toBe('2025-01-07') // Mon → Tue
    })

    it('should skip over the weekend', () => {
      expect(dayjs('2025-01-03').nextBusinessDay().format('YYYY-MM-DD')).toBe('2025-01-06') // Fri → Mon
    })
  })

  describe('prevBusinessDay', () => {
    it('should return the previous business day from a weekday', () => {
      expect(dayjs('2025-01-07').prevBusinessDay().format('YYYY-MM-DD')).toBe('2025-01-06') // Tue → Mon
    })

    it('should skip over the weekend', () => {
      expect(dayjs('2025-01-06').prevBusinessDay().format('YYYY-MM-DD')).toBe('2025-01-03') // Mon → Fri
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
  })

  describe('businessDaysInMonth', () => {
    it('should return all business days in January 2025', () => {
      const days = dayjs('2025-01-15').businessDaysInMonth()
      // January 2025: Wed Jan 1–Fri Jan 3 (3) + four full Mon–Fri weeks (20) = 23
      expect(days).toHaveLength(23)
      expect(days[0].format('YYYY-MM-DD')).toBe('2025-01-01') // Wednesday
      expect(days[days.length - 1].format('YYYY-MM-DD')).toBe('2025-01-31') // Friday
    })

    it('should exclude holidays from the month result', () => {
      dayjs.setHolidays(['2025-01-01'])
      const days = dayjs('2025-01-15').businessDaysInMonth()
      expect(days).toHaveLength(22)
      expect(days[0].format('YYYY-MM-DD')).toBe('2025-01-02') // holiday excluded
    })
  })

  describe('holidays', () => {
    it('should exclude holidays from business days', () => {
      dayjs.setHolidays(['2025-01-06']) // Monday is a holiday
      expect(dayjs('2025-01-06').isBusinessDay()).toBe(false)
    })

    it('getHolidays should return the currently set holidays', () => {
      dayjs.setHolidays(['2025-12-25', '2025-01-01'])
      expect(dayjs.getHolidays()).toEqual(['2025-12-25', '2025-01-01'])
    })
  })
})
