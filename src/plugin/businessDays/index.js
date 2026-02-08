export default (o, c, d) => {
  const proto = c.prototype

  /**
   * Add business days (skipping weekends) to a date.
   * @param {number} days - Number of business days to add
   * @returns {Dayjs} New Dayjs instance
   */
  proto.addBusinessDays = function (days) {
    if (days === 0) return this.clone()
    if (days < 0) return this.subtractBusinessDays(-days)

    let current = this.clone()
    let remaining = days

    while (remaining > 0) {
      current = current.add(1, 'day')
      if (current.isBusinessDay()) {
        remaining -= 1
      }
    }

    return current
  }

  /**
   * Subtract business days from a date.
   * @param {number} days - Number of business days to subtract
   * @returns {Dayjs} New Dayjs instance
   */
  proto.subtractBusinessDays = function (days) {
    if (days === 0) return this.clone()
    if (days < 0) return this.addBusinessDays(-days)

    let current = this.clone()
    let remaining = days

    while (remaining > 0) {
      current = current.subtract(1, 'day')
      if (current.isBusinessDay()) {
        remaining -= 1
      }
    }

    return current
  }

  /**
   * Check if the current date is a business day.
   * @returns {boolean}
   */
  proto.isBusinessDay = function () {
    const day = this.day()
    return day !== 0 && day !== 6
  }

  /**
   * Get the next business day from the current date.
   * @returns {Dayjs} New Dayjs instance
   */
  proto.nextBusinessDay = function () {
    return this.addBusinessDays(1)
  }

  /**
   * Get the previous business day from the current date.
   * @returns {Dayjs} New Dayjs instance
   */
  proto.prevBusinessDay = function () {
    return this.subtractBusinessDays(1)
  }

  /**
   * Count the number of business days between this date and another date.
   * @param {Dayjs|string|Date} date - The end date
   * @returns {number} Number of business days
   */
  proto.businessDaysUntil = function (date) {
    const end = d(date)
    let current = this.clone()
    let count = 0

    if (current.isAfter(end)) {
      return -end.businessDaysUntil(current)
    }

    while (current.isBefore(end, 'day')) {
      current = current.add(1, 'day')
      if (current.isBusinessDay()) {
        count += 1
      }
    }

    return count
  }

  /**
   * Get all business days in the current month.
   * @returns {Array<Dayjs>} Array of Dayjs instances for each business day
   */
  proto.businessDaysInMonth = function () {
    const days = []
    let current = this.startOf('month')
    const endOfMonth = this.endOf('month')

    while (current.isBefore(endOfMonth, 'day') || current.isSame(endOfMonth, 'day')) {
      if (current.isBusinessDay()) {
        days.push(current)
      }
      current = current.add(1, 'day')
    }

    return days
  }

  /**
   * Set custom holidays that should be treated as non-business days.
   * Holidays is stored as a module-level Set for performance.
   */
  let holidays = new Set()

  d.setHolidays = function (dates) {
    holidays = new Set(dates.map(date => d(date).format('YYYY-MM-DD')))
  }

  d.getHolidays = function () {
    return Array.from(holidays)
  }

  // Override isBusinessDay to account for holidays
  const originalIsBusinessDay = proto.isBusinessDay
  proto.isBusinessDay = function () {
    if (!originalIsBusinessDay.call(this)) return false
    return !holidays.has(this.format('YYYY-MM-DD'))
  }
}
