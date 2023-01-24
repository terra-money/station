import { Button } from "components/general"
import { Read } from "components/token"
import { useBankBalance } from "data/queries/bank"
import { useAllMemoizedPrices, useMemoizedPrices } from "data/queries/coingecko"
import { useCurrency } from "data/settings/Currency"
import { useNativeDenoms } from "data/token"
import { useTranslation } from "react-i18next"
import styles from "./NetWorth.module.scss"
import { useWalletRoute, Path } from "./Wallet"
import { capitalize } from "@mui/material"

const NetWorth = () => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const coins = useBankBalance()
  const { data: prices } = useMemoizedPrices()
  const { data: pricesFromAll } = useAllMemoizedPrices()
  const readNativeDenom = useNativeDenoms()
  const { setRoute, route } = useWalletRoute()

  // TODO: show CW20 balances and staked tokens
  const coinsValue = coins?.reduce((acc, { amount, denom }) => {
    const { token, decimals } = readNativeDenom(denom)
    return (
      acc +
      (parseInt(amount) *
        (prices?.[token]?.price || pricesFromAll?.[denom]?.usd || 0)) /
        10 ** decimals
    )
  }, 0)

  return (
    <article className={styles.networth}>
      <p>{capitalize(t("asset value"))}</p>
      <h1>
        {currency.symbol}{" "}
        <Read amount={coinsValue} decimals={0} fixed={2} denom="" token="" />
      </h1>
      <p>
        {t("{{balance}} available", {
          balance: `${currency.symbol} ${coinsValue.toFixed(2)} `,
        })}
      </p>
      <div className={styles.networth__buttons}>
        <Button
          color="primary"
          onClick={() =>
            setRoute({
              path: Path.send,
              previusPage: route,
            })
          }
        >
          {capitalize(t("Send"))}
        </Button>
        <Button
          onClick={() =>
            setRoute({
              path: Path.transfer,
              previusPage: route,
            })
          }
        >
          {capitalize(t("transfer"))}
        </Button>
        <Button
          onClick={() =>
            setRoute({
              path: Path.receive,
              previusPage: route,
            })
          }
        >
          {capitalize(t("receive"))}
        </Button>
      </div>
    </article>
  )
}

export default NetWorth
