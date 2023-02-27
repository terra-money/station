import { useNativeDenoms } from "data/token"
import { useWalletRoute, Path } from "./Wallet"
import styles from "./AssetPage.module.scss"
import { Read, TokenIcon } from "components/token"
import { useCurrency } from "data/settings/Currency"
import { useExchangeRates } from "data/queries/coingecko"
import { useBankBalance } from "data/queries/bank"
import AssetChain from "./AssetChain"
import { Button } from "components/general"
import { useTranslation } from "react-i18next"
import { capitalize } from "@mui/material"
import Vesting from "./Vesting"
import { isTerraChain } from "utils/chain"

const AssetPage = () => {
  const currency = useCurrency()
  const { data: prices } = useExchangeRates()
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
  const price = symbol?.endsWith("...") ? 0 : prices?.[token]?.price ?? 0

  return (
    <>
      <section className={styles.details}>
        <TokenIcon token={token} icon={icon} size={50} />
        <h1>
          {currency.symbol}{" "}
          <Read
            decimals={decimals}
            amount={totalBalance * price}
            fixed={2}
            token={symbol}
          />
        </h1>
        <p>
          <Read decimals={decimals} amount={totalBalance} token={symbol} />
          {symbol}
        </p>
      </section>
      <section className={styles.chainlist}>
        <h3>{t("Chains")}</h3>
        <div className={styles.chainlist__list}>
          {filteredBalances
            .sort((a, b) => parseInt(b.amount) - parseInt(a.amount))
            .map((b, i) => (
              <div key={i}>
                <AssetChain
                  symbol={symbol}
                  balance={b.amount}
                  chain={b.chain}
                  token={token}
                  decimals={decimals}
                />
                {token === "uluna" && isTerraChain(b.chain) && <Vesting />}
              </div>
            ))}
        </div>
      </section>
      <section className={styles.actions}>
        <Button
          color="primary"
          onClick={() =>
            setRoute({
              path: Path.send,
              denom,
              previousPage: route,
            })
          }
        >
          {t("Send")}
        </Button>
        <Button
          onClick={() =>
            setRoute({
              path: Path.receive,
              previousPage: route,
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
