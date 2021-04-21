import { toNow } from "utils/date"
import Tooltip from "./Tooltip"

const ToNow = ({ children: date }: { children: Date }) => {
  return (
    <Tooltip content={date.toString()}>
      <span>{toNow(date)}</span>
    </Tooltip>
  )
}

export default ToNow
