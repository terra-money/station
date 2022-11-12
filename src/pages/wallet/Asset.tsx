import { useTranslation } from "react-i18next"
import { WithFetching } from "components/feedback"
import { Read, TokenIcon } from "components/token"
import { useMemoizedPrices } from "data/queries/coingecko"
import { combineState } from "data/query"
import { useCurrency } from "data/settings/Currency"
import { useChains } from "data/queries/chains"

import styles from "./Asset.module.scss"
import { ReactComponent as PriceUp } from "styles/images/icons/PriceUp.svg"
import { ReactComponent as PriceDown } from "styles/images/icons/PriceDown.svg"
import { useWalletRoute, Path } from "./Wallet"

export interface Props extends TokenItem, QueryState {
  balance?: Amount
  denom: string
  price?: number
  change?: number
  hideActions?: boolean
  chains: string[]
}

const Asset = (props: Props) => {
  const { token, icon, symbol, balance, denom, chains, decimals, ...state } =
    props
  const { t } = useTranslation()
  const currency = useCurrency()
  const chainsName = useChains()
  const { data: prices, ...pricesState } = useMemoizedPrices()
  const { route, setRoute } = useWalletRoute()

  const change = props.change || prices?.[token]?.change || 0

  return (
    <article
      className={styles.asset}
      key={token}
      onClick={() =>
        setRoute({ path: Path.coin, denom: token, previusPage: route })
      }
    >
      <section className={styles.details}>
        <TokenIcon token={token} icon={icon} size={50} />

        <div className={styles.details__container}>
          <h1 className={styles.symbol}>
            {symbol}
            {chains.map((chain) => (
              <span key={chain} className={styles.chains}>
                {chainsName[chain].name || chain}
              </span>
            ))}
            {chains && chains.length > 1 && (
              <span className={styles.chain__num}>{chains.length}</span>
            )}
          </h1>
          <h2 className={change >= 0 ? styles.change__up : styles.change__down}>
            {change >= 0 ? <PriceUp /> : <PriceDown />} {change.toFixed(2)}%
          </h2>
          <h1 className={styles.price}>
            {currency.unit}{" "}
            {(
              ((props.price || prices?.[token]?.price || 0) *
                parseInt(balance ?? "0")) /
              10 ** decimals
            ).toFixed(2)}
          </h1>
          <h2 className={styles.amount}>
            <WithFetching {...combineState(state, pricesState)} height={1}>
              {(progress, wrong) => (
                <>
                  {progress}
                  {wrong ? (
                    <span className="danger">
                      {t("Failed to query balance")}
                    </span>
                  ) : (
                    <Read {...props} amount={balance} token="" />
                  )}
                </>
              )}
            </WithFetching>{" "}
            {symbol}
          </h2>
        </div>
      </section>
    </article>
  )
}

export default Asset
