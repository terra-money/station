import { ReactNode } from "react"
import Tippy, { TippyProps } from "@tippyjs/react"
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined"
import { InlineFlex } from "../layout"

export const Popover = ({ theme = "popover", ...props }: TippyProps) => {
  return (
    <Tippy
      {...props}
      theme={theme}
      arrow={theme !== "none"}
      trigger="click"
      animation={false}
      interactive
    />
  )
}

const Tooltip = (props: TippyProps) => {
  return <Tippy {...props} animation={false} />
}

export default Tooltip

/* derive */
interface Props extends Omit<TippyProps, "children"> {
  children: ReactNode
}

export const TooltipIcon = (props: Props) => {
  return (
    <InlineFlex gap={4} start>
      {props.children}
      <Tooltip {...props}>
        <HelpOutlineOutlinedIcon fontSize="inherit" className="muted" />
      </Tooltip>
    </InlineFlex>
  )
}
