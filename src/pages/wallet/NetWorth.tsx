import { Button } from "components/general"
import { Read } from "components/token"
import { useBankBalance } from "data/queries/bank"
import { useMemoizedPrices } from "data/queries/coingecko"
import { useCurrency } from "data/settings/Currency"
import { useNativeDenoms } from "data/token"
import { useTranslation } from "react-i18next"
import styles from "./NetWorth.module.scss"
import { useWalletRoute, Path } from "./Wallet"

const NetWorth = () => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const coins = useBankBalance()
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
      <p>Asset Value</p>
      <h1>
        {currency.unit}{" "}
        <Read amount={coinsValue} decimals={0} fixed={2} denom="" token="" />
      </h1>
      <p>
        {currency.unit}{" "}
        <Read amount={coinsValue} decimals={0} fixed={2} denom="" token="" />{" "}
        available
      </p>
      <div className={styles.networth__buttons}>
        <Button
          onClick={() =>
            setRoute({
              path: Path.send,
              previusPage: route,
            })
          }
        >
          {t("Send")}
        </Button>
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
      </div>
    </article>
  )
}

export default NetWorth
