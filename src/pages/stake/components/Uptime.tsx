import { readPercent } from "@terra-rebels/kitchen-utils"

const Uptime = ({ children: value }: { children: number }) => {
  return <span>{readPercent(value, { fixed: 2 })}</span>
}

export default Uptime
