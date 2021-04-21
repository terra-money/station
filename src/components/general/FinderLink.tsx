import { FC, ForwardedRef, forwardRef, HTMLAttributes } from "react"
import classNames from "classnames"
import { truncate } from "@terra.kitchen/utils"
import { FINDER } from "config/constants"
import { useNetworkName } from "data/wallet"
import ExternalLink from "./ExternalLink"
import styles from "./FinderLink.module.scss"

interface Props extends HTMLAttributes<HTMLAnchorElement> {
  value?: string

  /* path (default: address) */
  block?: boolean
  tx?: boolean
  validator?: boolean

  /* customize */
  short?: boolean
}

const FinderLink: FC<Props> = forwardRef(
  ({ children, short, ...rest }, ref: ForwardedRef<HTMLAnchorElement>) => {
    const { block, tx, validator, ...attrs } = rest
    const networkName = useNetworkName()
    const path = tx
      ? "tx"
      : block
      ? "block"
      : validator
      ? "validator"
      : "address"

    const value = rest.value ?? children
    const link = [FINDER, networkName, path, value].join("/")
    const className = classNames(attrs.className, styles.link)

    return (
      <ExternalLink {...attrs} href={link} className={className} ref={ref} icon>
        {short && typeof children === "string" ? truncate(children) : children}
      </ExternalLink>
    )
  }
)

export default FinderLink
