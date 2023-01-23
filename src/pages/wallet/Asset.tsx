import { useTranslation } from "react-i18next"
import { WithFetching } from "components/feedback"
import { Read, TokenIcon } from "components/token"
import { useMemoizedPrices, useAllMemoizedPrices } from "data/queries/coingecko"
import { combineState } from "data/query"
import { useCurrency } from "data/settings/Currency"

import styles from "./Asset.module.scss"
import { ReactComponent as PriceUp } from "styles/images/icons/PriceUp.svg"
import { ReactComponent as PriceDown } from "styles/images/icons/PriceDown.svg"
import { useWalletRoute, Path } from "./Wallet"
import { useNetwork } from "data/wallet"

export interface Props extends TokenItem, QueryState {
  balance?: Amount
  denom: string
  price?: number
  change?: number
  hideActions?: boolean
  chains: string[]
}

const Asset = (props: Props) => {
  const { token, icon, symbol, balance, denom, decimals, ...state } = props
  const { t } = useTranslation()
  const currency = useCurrency()
  const network = useNetwork()
  const chains = props.chains.filter((chain) => !!network[chain])

  const { data: prices, ...pricesState } = useMemoizedPrices()
  const { data: pricesFromAll, ...pricesFromAllState } = useAllMemoizedPrices()
  const { route, setRoute } = useWalletRoute()

  const coinPrice =
    props.price || prices?.[token]?.price || pricesFromAll?.[denom]?.usd || 0
  const change =
    props.change ||
    prices?.[token]?.change ||
    pricesFromAll?.[denom]?.change24h ||
    0
  const walletPrice = coinPrice * parseInt(balance ?? "0")

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
                {network[chain].name || chain}
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
            {walletPrice / 10 ** decimals < 0.01 &&
              parseInt(balance ?? "0") > 0 &&
              "<"}
            {currency.unit}{" "}
            <Read
              {...props}
              amount={walletPrice}
              decimals={decimals}
              fixed={2}
              denom=""
              token=""
            />
          </h1>
          <h2 className={styles.amount}>
            <WithFetching
              {...combineState(state, pricesState, pricesFromAllState)}
              height={1}
            >
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
