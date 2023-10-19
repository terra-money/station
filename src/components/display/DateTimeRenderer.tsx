import { ToNow } from "."

const validFormats = ["relative", "localestring"] as const

interface Props {
  children: string | Date
  format: typeof validFormats[number]
  update?: boolean
}

const DateTimeRenderer = ({ children: timestamp, format, update }: Props) => {
  const dateString =
    typeof timestamp === "string" ? timestamp : timestamp.toISOString()

  switch (format) {
    case "relative":
      return <ToNow update={update}>{new Date(dateString)}</ToNow>
    case "localestring":
      return <span>{new Date(dateString).toLocaleString()}</span>
    default:
      return <span>{dateString}</span>
  }
}

export default DateTimeRenderer
