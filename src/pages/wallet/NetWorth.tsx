import { Button } from "components/general"
import { useMemoizedPrices } from "data/queries/coingecko"
import { useCurrency } from "data/settings/Currency"
import { useNativeDenoms } from "data/token"
import { useTranslation } from "react-i18next"
import { useCoins } from "./Coins"
import styles from "./NetWorth.module.scss"
import { useWalletRoute, Path } from "./Wallet"

const NetWorth = () => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const coins = useCoins()
  const { data: prices } = useMemoizedPrices()
  const readNativeDenom = useNativeDenoms()
  const { setRoute, route } = useWalletRoute()

  // TODO: show CW20 balances and staked tokens
  const coinsValue = coins?.reduce((acc, { amount, denom }) => {
    const { token, decimals } = readNativeDenom(denom)
    return (
      acc + (parseInt(amount) * (prices?.[token]?.price || 0)) / 10 ** decimals
    )
  }, 0)

  return (
    <article className={styles.networth}>
      <p>Net Worth</p>
      <h1>
        {currency.unit} {coinsValue.toFixed(2)}
      </h1>
      <p>
        {currency.unit} {coinsValue.toFixed(2)} available
      </p>
      <div className={styles.networth__buttons}>
        <Button color="primary">{t("Buy")}</Button>
        <Button
          onClick={() =>
            setRoute({
              path: Path.receive,
              previusPage: route,
            })
          }
        >
          {t("Receive")}
        </Button>
        <Button>{t("Send")}</Button>
      </div>
    </article>
  )
}

export default NetWorth
