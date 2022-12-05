import { ForwardedRef, HTMLAttributes, PropsWithChildren } from "react"
import { forwardRef } from "react"
import classNames from "classnames"
import { truncate } from "@terra.kitchen/utils"
import { FINDER, MINT_SCAN } from "config/constants"
import { useNetworkName } from "data/wallet"
import { useChains } from "data/queries/chains"
import { latestTxState } from "data/queries/tx"
import { ExternalLink } from "./External"
import { useRecoilValue } from "recoil"
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

const FinderLink = forwardRef(
  (
    { children, short, ...rest }: PropsWithChildren<Props>,
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    const { block, tx, validator, ...attrs } = rest
    const networkName = useNetworkName()
    const chains = useChains()
    const { chainID } = useRecoilValue(latestTxState)
    const network = chains[chainID]?.name.toLowerCase()

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
      network === "terra"
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
