import { ForwardedRef, forwardRef, HTMLProps, ReactNode } from "react"
import CallMadeIcon from "@mui/icons-material/CallMade"
import styles from "./Internal.module.scss"

interface ExternalLinkProps extends HTMLProps<HTMLAnchorElement> {
  icon?: boolean
}

export const ExternalLink = forwardRef(
  ({ icon, children, href, ...attrs }: ExternalLinkProps, ref: ForwardedRef<HTMLAnchorElement>) => {
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
  },
)

interface ExternalIconLinkProps extends HTMLProps<HTMLAnchorElement> {
  icon?: ReactNode
}

export const ExternalIconLink = forwardRef(
  (
    { icon, children, href, ...attrs }: ExternalIconLinkProps,
    ref: ForwardedRef<HTMLAnchorElement>,
  ) => {
    if (!validateLink(href)) return null

    return (
      <a
        {...attrs}
        className={styles.item}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        ref={ref}
      >
        <span className={styles.icon}>{icon}</span>
        {children}
      </a>
    )
  },
)

export const validateLink = (href?: string) => {
  if (!href) return false

  try {
    const url = new URL(href)
    return ["https:", "mailto:"].includes(url.protocol)
  } catch {
    return false
  }
}
