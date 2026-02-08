import MockDate from 'mockdate'
import dayjs from '../../src'
import businessDays from '../../src/plugin/businessDays'

dayjs.extend(businessDays)

beforeEach(() => {
  MockDate.set(new Date())
  dayjs.setHolidays([])
})

afterEach(() => {
  MockDate.reset()
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

    it('should handle adding zero business days', () => {
      const date = dayjs('2025-01-06')
      const result = date.addBusinessDays(0)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should handle adding negative business days', () => {
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
      const date = dayjs('2025-01-06')
      const result = date.subtractBusinessDays(0)
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-06')
    })

    it('should handle subtracting negative business days', () => {
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

    it('should return 0 for same day', () => {
      const date = dayjs('2025-01-06')
      expect(date.businessDaysUntil(date)).toBe(0)
    })

    it('should skip weekends in count', () => {
      const friday = dayjs('2025-01-03')
      const monday = dayjs('2025-01-06')
      expect(friday.businessDaysUntil(monday)).toBe(1)
    })
  })

  describe('businessDaysInMonth', () => {
    it('should return all business days in a month', () => {
      const date = dayjs('2025-01-15')
      const businessDays = date.businessDaysInMonth()
      // January 2025 has 23 business days (31 days - 4 weekend Saturdays - 4 weekend Sundays)
      expect(businessDays.length).toBe(23)
      businessDays.forEach(day => {
        expect(day.isBusinessDay()).toBe(true)
      })
    })

    it('should respect holidays when computing business days in month', () => {
      dayjs.setHolidays(['2025-01-06', '2025-01-20']) // Two Mondays
      const date = dayjs('2025-01-15')
      const businessDays = date.businessDaysInMonth()
      // 23 business days - 2 holidays = 21
      expect(businessDays.length).toBe(21)
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
      // Should skip the holiday Monday and go to Tuesday
      expect(result.format('YYYY-MM-DD')).toBe('2025-01-07')
    })

    it('should handle holidays in businessDaysUntil', () => {
      dayjs.setHolidays(['2025-01-07']) // Tuesday is a holiday
      const monday = dayjs('2025-01-06')
      const friday = dayjs('2025-01-10')
      // Wed, Thu, Fri = 3 days (Tue is holiday, Mon is start not counted)
      expect(monday.businessDaysUntil(friday)).toBe(3)
    })
  })
})
