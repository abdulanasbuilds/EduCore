declare module 'date-fns' {
  export function format(date: Date | string, formatStr: string, options?: object): string;
  export function parseISO(dateString: string): Date;
  export function addDays(date: Date | string, amount: number): Date;
  export function addYears(date: Date | string, amount: number): Date;
  export function addMonths(date: Date | string, amount: number): Date;
  export function subDays(date: Date | string, amount: number): Date;
  export function subMonths(date: Date | string, amount: number): Date;
  export function startOfWeek(date: Date | string, options?: object): Date;
  export function endOfWeek(date: Date | string, options?: object): Date;
  export function startOfMonth(date: Date | string): Date;
  export function endOfMonth(date: Date | string): Date;
  export function isSameDay(dateLeft: Date | string, dateRight: Date | string): boolean;
  export function isSameMonth(dateLeft: Date | string, dateRight: Date | string): boolean;
  export function isToday(date: Date | string): boolean;
  export function isWithinInterval(date: Date | string, options: { start: Date | string; end: Date | string }): boolean;
  export function eachDayOfInterval(options: { start: Date | string; end: Date | string }): Date[];
  export function max(dates: (Date | string)[]): Date;
  export function min(dates: (Date | string)[]): Date;
  export function differenceInDays(dateLeft: Date | string, dateRight: Date | string): number;
  export function differenceInWeeks(dateLeft: Date | string, dateRight: Date | string): number;
  export function differenceInMonths(dateLeft: Date | string, dateRight: Date | string): number;
  export function getDay(date: Date | string): number;
}
