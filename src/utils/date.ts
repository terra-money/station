import { formatDistanceToNowStrict } from "date-fns"

export const toNow = (date: Date) =>
  formatDistanceToNowStrict(date, { addSuffix: true })
