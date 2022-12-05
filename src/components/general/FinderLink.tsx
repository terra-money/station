import { ForwardedRef, HTMLAttributes, PropsWithChildren } from "react"
import { forwardRef } from "react"
import classNames from "classnames"
import { truncate } from "@terra.kitchen/utils"
import { FINDER, MINT_SCAN } from "config/constants"
import { useNetworkName } from "data/wallet"
import { useChains } from "data/queries/chains"
import { ExternalLink } from "./External"
import styles from "./FinderLink.module.scss"

interface Props extends HTMLAttributes<HTMLAnchorElement> {
  value?: string
  /* path (default: address) */
  block?: boolean
  tx?: boolean
  validator?: boolean
  chainID?: string
  /* customize */
  short?: boolean
}

const FinderLink = forwardRef(
  (
    { children, short, ...rest }: PropsWithChildren<Props>,
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    const { block, tx, validator, chainID, ...attrs } = rest
    const networkName = useNetworkName()
    const chains = useChains()
    const network = chainID && chains[chainID]?.name.toLowerCase()

    const interchainPath = tx
      ? "txs"
      : block
      ? "blocks"
      : validator
      ? "validators"
      : "account"

    const finderPath = tx
      ? "tx"
      : block
      ? "block"
      : validator
      ? "validator"
      : "address"

    const value = rest.value ?? children
    const link =
      !network || network === "terra"
        ? [FINDER, networkName, finderPath, value].join("/")
        : [MINT_SCAN, network, interchainPath, value].join("/")

    const className = classNames(attrs.className, styles.link)

    return (
      <ExternalLink {...attrs} href={link} className={className} ref={ref} icon>
        {short && typeof children === "string" ? truncate(children) : children}
      </ExternalLink>
    )
  }
)

export default FinderLink
