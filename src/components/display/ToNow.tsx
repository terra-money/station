import { useState } from "react"
import { toNow } from "utils/date"
import useInterval from "utils/hooks/useInterval"
import Tooltip from "./Tooltip"

interface Props {
  children: Date
  update?: boolean
}

const ToNow = ({ children: date, update }: Props) => {
  const [, setKey] = useState(0)
  useInterval(
    () => {
      setKey((key) => key + 1)
    },
    update ? 1000 : null
  )

  return (
    <Tooltip content={date.toLocaleString()}>
      <span>{toNow(date)}</span>
    </Tooltip>
  )
}

export default ToNow
