import { ForwardedRef, forwardRef, HTMLProps } from "react"
import CallMadeIcon from "@mui/icons-material/CallMade"

interface Props extends HTMLProps<HTMLAnchorElement> {
  icon?: boolean
}

const ExternalLink = forwardRef(
  (
    { icon, children, href, ...attrs }: Props,
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    if (!validateLink(href)) return null

    return (
      <a
        {...attrs}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        ref={ref}
      >
        {children}
        {icon && <CallMadeIcon fontSize="inherit" />}
      </a>
    )
  }
)

export default ExternalLink

export const validateLink = (href?: string) => {
  if (!href) return false

  try {
    const url = new URL(href)
    return ["https:", "mailto:"].includes(url.protocol)
  } catch {
    return false
  }
}
