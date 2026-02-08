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

    it('should handle adding 0 business days', () => {
      const monday = dayjs('2025-01-06')
      const result = monday.addBusinessDays(0)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should work when starting from a weekend', () => {
      const saturday = dayjs('2025-01-04')
      const result = saturday.addBusinessDays(1)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should handle negative days by subtracting', () => {
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

    it('should handle subtracting 0 business days', () => {
      const monday = dayjs('2025-01-06')
      const result = monday.subtractBusinessDays(0)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should handle subtracting multiple business days', () => {
      const monday = dayjs('2025-01-13')
      const result = monday.subtractBusinessDays(5)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should handle negative days by adding', () => {
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

  describe('nextBusinessDay', () => {
    it('should return the next business day', () => {
      const friday = dayjs('2025-01-03')
      const next = friday.nextBusinessDay()
      expect(next.format('YYYY-MM-DD')).toBe('2025-01-06') // Monday
    })
  })

  describe('prevBusinessDay', () => {
    it('should return the previous business day', () => {
      const monday = dayjs('2025-01-06')
      const prev = monday.prevBusinessDay()
      expect(prev.format('YYYY-MM-DD')).toBe('2025-01-03') // Friday
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

    it('should return 0 for same day', () => {
      const day = dayjs('2025-01-06')
      expect(day.businessDaysUntil(day)).toBe(0)
    })

    it('should handle dates spanning weekends', () => {
      const friday = dayjs('2025-01-03')
      const monday = dayjs('2025-01-06')
      expect(friday.businessDaysUntil(monday)).toBe(1)
    })
  })

  describe('businessDaysInMonth', () => {
    it('should return all business days in a month', () => {
      const jan2025 = dayjs('2025-01-15')
      const daysInMonth = jan2025.businessDaysInMonth()
      expect(daysInMonth.length).toBe(23) // January 2025 has 23 business days
      // Verify all returned days are business days
      daysInMonth.forEach((day) => {
        expect(day.isBusinessDay()).toBe(true)
      })
    })

    it('should exclude weekends from business days', () => {
      const jan2025 = dayjs('2025-01-15')
      const daysInMonth = jan2025.businessDaysInMonth()
      daysInMonth.forEach((day) => {
        expect(day.day()).not.toBe(0) // Not Sunday
        expect(day.day()).not.toBe(6) // Not Saturday
      })
    })
  })

  describe('holidays', () => {
    it('should exclude holidays from business days', () => {
      dayjs.setHolidays(['2025-01-06']) // Monday is a holiday
      expect(dayjs('2025-01-06').isBusinessDay()).toBe(false)
      dayjs.setHolidays([]) // reset
    })

    it('should handle holidays in addBusinessDays', () => {
      dayjs.setHolidays(['2025-01-06']) // Monday is a holiday
      const friday = dayjs('2025-01-03')
      const result = friday.addBusinessDays(1)
      // Should skip Monday (holiday) and go to Tuesday
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-07')
      dayjs.setHolidays([]) // reset
    })

    it('should handle holidays in businessDaysUntil', () => {
      dayjs.setHolidays(['2025-01-06']) // Monday is a holiday
      const start = dayjs('2025-01-03') // Friday
      const end = dayjs('2025-01-07') // Tuesday
      // Only count Tuesday as business day (Monday is holiday)
      expect(start.businessDaysUntil(end)).toBe(1)
      dayjs.setHolidays([]) // reset
    })

    it('should get holidays', () => {
      dayjs.setHolidays(['2025-01-06', '2025-12-25'])
      const holidays = dayjs.getHolidays()
      expect(holidays).toEqual(['2025-01-06', '2025-12-25'])
      dayjs.setHolidays([]) // reset
    })
  })
})
