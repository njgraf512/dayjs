import { PluginFunc, ConfigType } from 'dayjs'

declare const plugin: PluginFunc
export = plugin

declare module 'dayjs' {
  interface Dayjs {
    addBusinessDays(days: number): Dayjs

    subtractBusinessDays(days: number): Dayjs

    isBusinessDay(): boolean

    nextBusinessDay(): Dayjs

    prevBusinessDay(): Dayjs

    businessDaysUntil(date: ConfigType): number

    businessDaysInMonth(): Dayjs[]
  }

  export function setHolidays(dates: ConfigType[]): void

  export function getHolidays(): string[]
}
