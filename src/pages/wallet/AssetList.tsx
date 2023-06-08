import { FormError } from "components/form"
import { InternalButton } from "components/general"
import { useBankBalance, useIsWalletEmpty } from "data/queries/bank"
import { useExchangeRates } from "data/queries/coingecko"
import { useNativeDenoms } from "data/token"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import ManageTokens from "./ManageTokens"
import Asset from "./Asset"
import styles from "./AssetList.module.scss"
import { useTokenFilters } from "utils/localStorage"
import { toInput } from "txs/utils"
import {
  useCustomTokensCW20,
  useCustomTokensNative,
} from "data/settings/CustomTokens"
import { useIBCBaseDenoms } from "data/queries/ibc"
import { useNetwork } from "data/wallet"
import { ReactComponent as ManageAssets } from "styles/images/icons/ManageAssets.svg"

const AssetList = () => {
  const { t } = useTranslation()
  const isWalletEmpty = useIsWalletEmpty()
  const { hideNoWhitelist, hideLowBal } = useTokenFilters()
  const networks = useNetwork()

  const coins = useBankBalance()
  const { data: prices } = useExchangeRates()
  const readNativeDenom = useNativeDenoms()
  const native = useCustomTokensNative()
  const cw20 = useCustomTokensCW20()
  const alwaysVisibleDenoms = useMemo(
    () =>
      new Set([
        ...cw20.list.map((a) => a.token),
        ...native.list.map((a) => a.denom),
      ]),
    [cw20.list, native.list]
  )

  const unknownIBCDenomsData = useIBCBaseDenoms(
    coins
      .map(({ denom, chain }) => ({ denom, chainID: chain }))
      .filter(({ denom }) => {
        const data = readNativeDenom(denom)
        return denom.startsWith("ibc/") && data.symbol.endsWith("...")
      })
  )
  const unknownIBCDenoms = unknownIBCDenomsData.reduce(
    (acc, { data }) =>
      data
        ? {
            ...acc,
            [data.ibcDenom]: {
              baseDenom: data.baseDenom,
              chainID: data.chainIDs[0],
              chainIDs: data.chainIDs,
            },
          }
        : acc,
    {} as Record<
      string,
      { baseDenom: string; chainID: string; chainIDs: string[] }
    >
  )

  const list = useMemo(
    () =>
      [
        ...Object.values(
          coins.reduce((acc, { denom, amount, chain }) => {
            const data = readNativeDenom(
              unknownIBCDenoms[denom]?.baseDenom ?? denom,
              unknownIBCDenoms[denom]?.chainID ?? chain
            )

            const key = [
              // @ts-expect-error
              unknownIBCDenoms[denom]?.chainID ?? data.chainID ?? chain,
              data.token,
            ].join("*")

            if (acc[key]) {
              acc[key].balance = `${
                parseInt(acc[key].balance) + parseInt(amount)
              }`
              acc[key].chains.push(chain)
              return acc
            } else {
              return {
                ...acc,
                [key]: {
                  denom: data.token,
                  balance: amount,
                  icon: data.icon,
                  symbol: data.symbol,
                  price: prices?.[data.token]?.price ?? 0,
                  change: prices?.[data.token]?.change ?? 0,
                  chains: [chain],
                  id: key,
                  whitelisted: !(
                    data.isNonWhitelisted ||
                    unknownIBCDenoms[denom]?.chainIDs.find((c) => !networks[c])
                  ),
                },
              }
            }
          }, {} as Record<string, any>)
        ),
      ]
        .filter(
          (a) => (hideNoWhitelist ? a.whitelisted : true) // TODO: update and implement whitelist check
        )
        .filter((a) => {
          const { token } = readNativeDenom(a.denom)

          if (!hideLowBal || a.price === 0 || alwaysVisibleDenoms.has(token))
            return true
          return a.price * toInput(a.balance) >= 1
        })
        .sort(
          (a, b) =>
            b.price * parseInt(b.balance) - a.price * parseInt(a.balance)
        ),
    [
      coins,
      readNativeDenom,
      prices,
      hideNoWhitelist,
      hideLowBal,
      alwaysVisibleDenoms,
      unknownIBCDenoms,
      networks,
    ]
  )

  const render = () => {
    if (!coins) return

    return (
      <div>
        {isWalletEmpty && (
          <FormError>{t("Coins required to post transactions")}</FormError>
        )}
        <section>
          {(prices || !hideLowBal) &&
            list.map(({ denom, chainID, id, ...item }, i) => (
              <Asset
                denom={denom}
                {...readNativeDenom(
                  unknownIBCDenoms[denom]?.baseDenom ?? denom,
                  unknownIBCDenoms[denom]?.chainID ?? chainID
                )}
                id={id}
                {...item}
                key={i}
              />
            ))}
        </section>
      </div>
    )
  }

  return (
    <article className={styles.assetlist}>
      <div className={styles.assetlist__title}>
        <h3>Assets</h3>
        <ManageTokens>
          {(open) => (
            <InternalButton className={styles.manage__button} onClick={open}>
              {t("Manage")}
              <ManageAssets />
            </InternalButton>
          )}
        </ManageTokens>
      </div>
      <div className={styles.assetlist__list}>{render()}</div>
    </article>
  )
}

export default AssetList
