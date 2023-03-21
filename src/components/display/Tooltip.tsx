import { ReactNode } from "react"
import { useLocation } from "react-router-dom"
import Tippy, { TippyProps } from "@tippyjs/react"
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined"
import { InlineFlex } from "../layout"

export const Popover = ({ theme = "popover", ...props }: TippyProps) => {
  const { pathname } = useLocation()

  return (
    <Tippy
      theme={theme}
      arrow={theme !== "none"}
      trigger="click"
      animation={false}
      maxWidth={360}
      interactive
      key={pathname}
      {...props}
    />
  )
}

const Tooltip = (props: TippyProps) => {
  return <Tippy {...props} animation={false} />
}

export default Tooltip

/* derive */
interface Props extends Omit<TippyProps, "children"> {
  children?: ReactNode
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
