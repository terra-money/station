import { ForwardedRef, HTMLAttributes, PropsWithChildren } from "react"
import { forwardRef } from "react"
import classNames from "classnames"
import { truncate } from "@terra.kitchen/utils"
import { FINDER, MINT_SCAN } from "config/constants"
import { useNetwork, useNetworkName } from "data/wallet"
import { latestTxState } from "data/queries/tx"
import { ExternalLink } from "./External"
import { useRecoilValue } from "recoil"
import { getChainIDFromAddress } from "utils/bech32"
import styles from "./FinderLink.module.scss"
import { AccAddress } from "@terra-money/feather.js"

interface Props extends HTMLAttributes<HTMLAnchorElement> {
  value?: string
  /* path (default: address) */
  block?: boolean
  tx?: boolean
  chain?: string
  validator?: boolean
  /* customize */
  short?: boolean
}

const FinderLink = forwardRef(
  (
    { children, short, ...rest }: PropsWithChildren<Props>,
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    const { block, tx, validator, chain, ...attrs } = rest
    const networkName = useNetworkName()
    const networks = useNetwork()
    const { chainID: lastTxChainID } = useRecoilValue(latestTxState)
    const value = rest.value ?? children
    const chainID =
      rest.value &&
      AccAddress.validate(rest.value) &&
      getChainIDFromAddress(rest.value, networks)

    const network =
      chain?.toLowerCase() ||
      networks[chainID || lastTxChainID]?.name.toLowerCase()

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
