export default (o, c, d) => {
  const proto = c.prototype
  let holidays = []

  d.setHolidays = function (dates) {
    holidays = dates.map(date => d(date).format('YYYY-MM-DD'))
  }

  d.getHolidays = function () {
    return holidays
  }

  /**
   * Check if the current date is a business day (not a weekend or holiday).
   * @returns {boolean}
   */
  proto.isBusinessDay = function () {
    const day = this.day()
    if (day === 0 || day === 6) return false
    return !holidays.includes(this.format('YYYY-MM-DD'))
  }

  /**
   * Add business days (skipping weekends and holidays) to a date.
   * @param {number} days - Number of business days to add
   * @returns {Dayjs} New Dayjs instance
   */
  proto.addBusinessDays = function (days) {
    let current = this.clone()
    let remaining = days

    while (remaining > 0) {
      current = current.add(1, 'day')
      if (current.isBusinessDay()) {
        remaining--
      }
    }

    return current
  }

  /**
   * Subtract business days (skipping weekends and holidays) from a date.
   * @param {number} days - Number of business days to subtract
   * @returns {Dayjs} New Dayjs instance
   */
  proto.subtractBusinessDays = function (days) {
    let current = this.clone()
    let remaining = days

    while (remaining > 0) {
      current = current.subtract(1, 'day')
      if (current.isBusinessDay()) {
        remaining--
      }
    }

    return current
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
   * Excludes the start date, includes the end date.
   * Returns a negative number if end is before start.
   * @param {Dayjs|string|Date} date - The end date
   * @returns {number} Number of business days
   */
  proto.businessDaysUntil = function (date) {
    const end = d(date)

    if (this.isAfter(end)) {
      return -end.businessDaysUntil(this)
    }

    let current = this.clone()
    let count = 0

    while (current.isBefore(end, 'day')) {
      current = current.add(1, 'day')
      if (current.isBusinessDay()) {
        count++
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

    while (current.isBefore(endOfMonth) || current.isSame(endOfMonth, 'day')) {
      if (current.isBusinessDay()) {
        days.push(current)
      }
      current = current.add(1, 'day')
    }

    return days
  }
}
