import { FormError } from "components/form"
import { InternalButton, Button } from "components/general"
import { useBankBalance, useIsWalletEmpty } from "data/queries/bank"
import { useMemoizedPrices } from "data/queries/coingecko"
import { useNativeDenoms } from "data/token"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import ManageTokens from "./ManageTokens"
import Asset from "./Asset"
import styles from "./AssetList.module.scss"
import { useTokenFilters } from "utils/localStorage"
import { toInput } from "txs/utils"
import { ModalButton } from "components/feedback"
import AddIcon from "@mui/icons-material/Add"
import FiatRampModal from "./FiatRampModal"

const AssetList = () => {
  const { t } = useTranslation()
  const isWalletEmpty = useIsWalletEmpty()
  const { hideNoWhitelist, hideLowBal } = useTokenFilters()

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
        .filter(
          (a) => (hideNoWhitelist ? !a.symbol.endsWith("...") : a) // TODO: update and implement whitelist check
        )
        .filter((a) => (hideLowBal ? a.price * toInput(a.balance) >= 1 : a))
        .sort(
          (a, b) =>
            b.price * parseInt(b.balance) - a.price * parseInt(a.balance)
        ),
    [coins, readNativeDenom, hideNoWhitelist, hideLowBal, prices]
  )
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
        <ModalButton
          minimal
          renderButton={(open) => (
            <InternalButton onClick={open}>{t("Buy tokens")}</InternalButton>
          )}
        >
          <FiatRampModal />
        </ModalButton>
      </div>
      <div className={styles.assetlist__list}>{render()}</div>
      <ManageTokens>
        {(open) => (
          <Button onClick={open}>
            <AddIcon />
            {t("Manage tokens")}
          </Button>
        )}
      </ManageTokens>
    </article>
  )
}

export default AssetList
