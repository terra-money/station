import { FormError } from "components/form"
import { InternalButton } from "components/general"
import { useBankBalance, useIsWalletEmpty } from "data/queries/bank"
import { useMemoizedPrices } from "data/queries/coingecko"
import { useNativeDenoms } from "data/token"
import { useNetworkName } from "data/wallet"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import ManageTokens from "./ManageTokens"
import Asset from "./Asset"
import styles from "./AssetList.module.scss"
import { getLocalSetting, SettingKey } from "utils/localStorage"
import { useWhitelist } from "data/queries/chains"

const AssetList = () => {
  const { t } = useTranslation()
  const isWalletEmpty = useIsWalletEmpty()
  const filterNonWhiteList = !!getLocalSetting(
    SettingKey.HideNonWhitelistTokens
  )
  const { whitelist } = useWhitelist()
  const networkName = useNetworkName()

  const coins = useBankBalance()
  const { data: prices } = useMemoizedPrices()
  const readNativeDenom = useNativeDenoms()

  const list = useMemo(
    () =>
      [
        ...Object.values(
          coins.reduce((acc, { denom, amount, chain }) => {
            const data = readNativeDenom(denom)
            if (acc[data.token]) {
              acc[data.token].balance = `${
                parseInt(acc[data.token].balance) + parseInt(amount)
              }`
              acc[data.token].chains.push(chain)
              return acc
            } else {
              return {
                ...acc,
                [data.token]: {
                  denom,
                  balance: amount,
                  icon: data.icon,
                  symbol: data.symbol,
                  price: prices?.[data.token]?.price ?? 0,
                  change: prices?.[data.token]?.change ?? 0,
                  chains: [chain],
                },
              }
            }
          }, {} as Record<string, any>)
        ),
      ]
        .filter((a) =>
          filterNonWhiteList
            ? Object.values(whitelist[networkName]).some(
                (b) => b.token === a.denom
              )
            : a
        )
        .sort(
          (a, b) =>
            b.price * parseInt(b.balance) - a.price * parseInt(a.balance)
        ),
    [coins, readNativeDenom, prices, filterNonWhiteList, networkName, whitelist]
  )
  console.log("list", list)

  const render = () => {
    if (!coins) return

    return (
      <div>
        {isWalletEmpty && (
          <FormError>{t("Coins required to post transactions")}</FormError>
        )}
        <section>
          {list.map(({ denom, ...item }) => (
            <Asset
              denom={denom}
              {...readNativeDenom(denom)}
              {...item}
              key={denom}
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
            <InternalButton onClick={open}>{t("Manage tokens")}</InternalButton>
          )}
        </ManageTokens>
      </div>
      <div className={styles.assetlist__list}>{render()}</div>
    </article>
  )
}

export default AssetList
