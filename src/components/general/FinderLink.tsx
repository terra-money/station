import { ForwardedRef, HTMLAttributes, PropsWithChildren } from "react"
import { forwardRef } from "react"
import classNames from "classnames"
import { truncate } from "@terra.kitchen/utils"
import { FINDER, MINTSCAN } from "config/constants"
import { useNetwork, useNetworkName } from "data/wallet"
import { latestTxState } from "data/queries/tx"
import { ExternalLink } from "./External"
import { useRecoilValue } from "recoil"
import { getChainIDFromAddress } from "utils/bech32"
import styles from "./FinderLink.module.scss"
import { AccAddress } from "@terra-money/feather.js"
import { useGetChainNamefromID } from "data/queries/chains"

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
    const networkName = useNetworkName()
    const networks = useNetwork()
    const getChainNamefromID = useGetChainNamefromID()
    const { chainID: lastTxChainID } = useRecoilValue(latestTxState)

    const value = rest.value ?? children

    const targetChainId =
      lastTxChainID ||
      chainID ||
      (rest.value && getChainIDFromAddress(rest.value, networks))

    const chainName = getChainNamefromID(targetChainId)

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
      chainName !== "terra"
        ? [MINTSCAN, chainName, interchainPath, value].join("/")
        : [FINDER, networkName, finderPath, value].join("/")

    const className = classNames(attrs.className, styles.link)

    return (
      <ExternalLink {...attrs} href={link} className={className} ref={ref} icon>
        {short && typeof children === "string" ? truncate(children) : children}
      </ExternalLink>
    )
  }
)

export default FinderLink
