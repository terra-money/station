import { ForwardedRef, HTMLAttributes, PropsWithChildren } from "react"
import { forwardRef } from "react"
import classNames from "classnames"
import { truncate } from "@terra-money/terra-utils"
import { useNetwork } from "data/wallet"
import { ExternalLink } from "./External"
import { getChainIDFromAddress } from "utils/bech32"
import styles from "./FinderLink.module.scss"

interface Props extends HTMLAttributes<HTMLAnchorElement> {
  value?: string
  /* path (default: address) */
  block?: boolean
  tx?: boolean
  chainID?: string
  validator?: boolean
  /* customize */
  short?: boolean
}

const FinderLink = forwardRef(
  (
    { children, short, ...rest }: PropsWithChildren<Props>,
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    const { block, tx, validator, chainID, ...attrs } = rest
    const networks = useNetwork()
    const value =
      rest.value || (typeof children === "string" ? (children as string) : "")

    const className = classNames(attrs.className, styles.link)
    const explorer =
      networks[chainID ?? getChainIDFromAddress(value, networks) ?? ""]
        ?.explorer

    let href
    if (block) {
      href = explorer?.block?.replace("{}", value)
    } else if (tx) {
      href = explorer?.tx?.replace("{}", value)
    } else if (validator) {
      href = explorer?.validator?.replace("{}", value)
    } else {
      href = explorer?.address?.replace("{}", value)
    }

    return (
      <ExternalLink {...attrs} href={href} className={className} ref={ref} icon>
        {short && typeof children === "string" ? truncate(children) : children}
      </ExternalLink>
    )
  }
)

export default FinderLink
