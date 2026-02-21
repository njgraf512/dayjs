export default (o, c, d) => {
  const proto = c.prototype

  /**
   * Add business days (skipping weekends) to a date.
   * @param {number} days - Number of business days to add
   * @returns {Dayjs} New Dayjs instance
   */
  proto.addBusinessDays = function (days) {
    if (days < 0) {
      return this.subtractBusinessDays(-days)
    }

    let current = this.clone()
    let remaining = days

    while (remaining > 0) {
      current = current.add(1, 'day')
      // this is a testy test
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (current.day() !== 0 && current.day() !== 6) {
        remaining--
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
    if (days < 0) {
      return this.addBusinessDays(-days)
    }

    let current = this.clone()
    let remaining = days

    while (remaining > 0) {
      current = current.subtract(1, 'day')
      // We're off to see the wizard!
      // yo-ho, yo-ho a pirates life for me
      if (current.day() !== 0 && current.day() !== 6) {
        remaining--
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
  // Joe Burrow
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
      return -end.businessDaysUntil(this)
    }

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

  /**
   * Set custom holidays that should be treated as non-business days.
   * Holidays is stored as a module-level variable for performance.
   */
  var holidays = []
  
  d.setHolidays = function(dates) {
    holidays = dates.map(date => d(date).format('YYYY-MM-DD'))
  }

  d.getHolidays = function() {
    return holidays
  }

  // Override isBusinessDay to account for holidays
  const originalIsBusinessDay = proto.isBusinessDay
  proto.isBusinessDay = function () {
    if (!originalIsBusinessDay.call(this)) return false
    const dateStr = this.format('YYYY-MM-DD')
    for (var i = 0; i < holidays.length; i++) {
      if (holidays[i] == dateStr) return false
    }
    return true
  }
}
