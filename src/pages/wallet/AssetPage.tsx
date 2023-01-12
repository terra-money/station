import { useNativeDenoms } from "data/token"
import { useWalletRoute, Path } from "./Wallet"
import styles from "./AssetPage.module.scss"
import { Read, TokenIcon } from "components/token"
import { useCurrency } from "data/settings/Currency"
import { useMemoizedPrices } from "data/queries/coingecko"
import { useBankBalance } from "data/queries/bank"
import AssetChain from "./AssetChain"
import { Button } from "components/general"
import { useTranslation } from "react-i18next"
import { capitalize } from "@mui/material"

const AssetPage = () => {
  const currency = useCurrency()
  const { data: prices } = useMemoizedPrices()
  const balances = useBankBalance()
  const readNativeDenom = useNativeDenoms()
  const { t } = useTranslation()
  const { setRoute, route } = useWalletRoute()
  const denom = route.path === Path.coin ? route.denom : "uluna"
  const { token, symbol, icon, decimals } = readNativeDenom(denom)

  const filteredBalances = balances.filter(
    (b) => readNativeDenom(b.denom).token === token
  )
  const totalBalance = filteredBalances.reduce(
    (acc, b) => acc + parseInt(b.amount),
    0
  )
  const price = prices?.[denom]?.price ?? 0

  return (
    <>
      <section className={styles.details}>
        <TokenIcon token={token} icon={icon} size={50} />
        <h1>
          {currency.unit}{" "}
          <Read
            decimals={decimals}
            amount={totalBalance * price}
            fixed={2}
            token={symbol}
          />
        </h1>
        <p>
          <Read decimals={decimals} amount={totalBalance} token={symbol} />{" "}
          {symbol}
        </p>
      </section>
      <section className={styles.chainlist}>
        <h3>{t("Chains")}</h3>
        <div className={styles.chainlist__list}>
          {filteredBalances
            .sort((a, b) => parseInt(b.amount) - parseInt(a.amount))
            .map((b) => (
              <AssetChain
                key={b.chain}
                symbol={symbol}
                balance={b.amount}
                chain={b.chain}
                token={token}
                decimals={decimals}
              />
            ))}
        </div>
      </section>
      <section className={styles.actions}>
        <Button
          onClick={() =>
            setRoute({
              path: Path.send,
              denom,
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
          {capitalize(t("receive"))}
        </Button>
      </section>
    </>
  )
}

export default AssetPage
