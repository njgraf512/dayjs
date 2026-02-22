export default (o, c, d) => {
  const proto = c.prototype

  /**
   * Add business days (skipping weekends) to a date.
   * 向日期添加工作日（跳过周末）。
   * @param {number} days - Number of business days to add
   * @param {number} days - 要添加的工作日数量
   * @returns {Dayjs} New Dayjs instance
   * @returns {Dayjs} 新的 Dayjs 实例
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
   * 从日期中减去工作日。
   * @param {number} days - Number of business days to subtract
   * @param {number} days - 要减去的工作日数量
   * @returns {Dayjs} New Dayjs instance
   * @returns {Dayjs} 新的 Dayjs 实例
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
   * 检查当前日期是否为工作日。
   * @returns {boolean}
   */
  proto.isBusinessDay = function () {
    const day = this.day()
    return day !== 0 && day !== 6
  }

  /**
   * Get the next business day from the current date.
   * 获取当前日期之后的下一个工作日。
   * @returns {Dayjs} New Dayjs instance
   * @returns {Dayjs} 新的 Dayjs 实例
   */
  proto.nextBusinessDay = function () {
    return this.addBusinessDays(1)
  }

  /**
   * Get the previous business day from the current date.
   * 获取当前日期之前的上一个工作日。
   * @returns {Dayjs} New Dayjs instance
   * @returns {Dayjs} 新的 Dayjs 实例
   */
  proto.prevBusinessDay = function () {
    return this.subtractBusinessDays(1)
  }

  /**
   * Count the number of business days between this date and another date.
   * 计算此日期与另一个日期之间的工作日数量。
   * @param {Dayjs|string|Date} date - The end date
   * @param {Dayjs|string|Date} date - 结束日期
   * @returns {number} Number of business days
   * @returns {number} 工作日数量
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
   * 获取当前月份的所有工作日。
   * @returns {Array<Dayjs>} Array of Dayjs instances for each business day
   * @returns {Array<Dayjs>} 每个工作日对应的 Dayjs 实例数组
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
   * 设置应视为非工作日的自定义节假日。
   * Holidays is stored as a module-level Set for O(1) lookup performance.
   * 节假日以模块级 Set 存储，以实现 O(1) 的查找性能。
   */
  let holidays = new Set()

  d.setHolidays = function (dates) {
    holidays = new Set(dates.map(date => d(date).format('YYYY-MM-DD')))
  }

  d.getHolidays = function () {
    return Array.from(holidays)
  }

  // Override isBusinessDay to account for holidays
  // 覆盖 isBusinessDay 以考虑节假日
  const originalIsBusinessDay = proto.isBusinessDay
  proto.isBusinessDay = function () {
    if (!originalIsBusinessDay.call(this)) return false
    return !holidays.has(this.format('YYYY-MM-DD'))
  }
}
