import { ForwardedRef, HTMLAttributes, PropsWithChildren, useMemo } from "react"
import { forwardRef } from "react"
import classNames from "classnames"
import { truncate } from "@terra.kitchen/utils"
import {
  FINDER,
  MINTSCAN,
  MARS_TEST_EXPLORER,
  MARS_EXPLORER,
} from "config/constants"
import { useNetwork, useNetworkName } from "data/wallet"
import { ExternalLink } from "./External"
import { getChainIDFromAddress } from "utils/bech32"
import styles from "./FinderLink.module.scss"
import { getChainNamefromID } from "data/queries/chains"

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
    const networkName = useNetworkName() // mainnet or testnet for Terra
    const networks = useNetwork()
    const value = rest.value ?? children

    const chainName = useMemo(() => {
      const targetChainId = chainID || getChainIDFromAddress(value, networks)
      return getChainNamefromID(targetChainId, networks)
    }, [value, chainID, networks])

    const interchainPath = tx
      ? "txs"
      : block
      ? "blocks"
      : validator
      ? "validators"
      : "account"

    const marsPath = tx
      ? "transactions"
      : block
      ? "blocks"
      : validator
      ? "validators"
      : "accounts"

    const finderPath = tx
      ? "tx"
      : block
      ? "block"
      : validator
      ? "validator"
      : "address"

    const link =
      chainName === "mars"
        ? [
            networkName === "testnet" ? MARS_TEST_EXPLORER : MARS_EXPLORER,
            marsPath,
            value,
          ].join("/")
        : chainName === "terra" || chainName === "classic"
        ? [FINDER, networkName, finderPath, value].join("/")
        : [MINTSCAN, chainName, interchainPath, value].join("/")

    const className = classNames(attrs.className, styles.link)

    return (
      <ExternalLink {...attrs} href={link} className={className} ref={ref} icon>
        {short && typeof children === "string" ? truncate(children) : children}
      </ExternalLink>
    )
  }
)

export default FinderLink
