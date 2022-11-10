import { useTranslation } from "react-i18next"
import { WithFetching } from "components/feedback"
import { Read, TokenIcon } from "components/token"
import { useMemoizedPrices } from "data/queries/coingecko"
import styles from "./Asset.module.scss"
import { combineState } from "data/query"
import { useCurrency } from "data/settings/Currency"

export interface Props extends TokenItem, QueryState {
  balance?: Amount
  denom: string
  price?: number
  change?: number
  hideActions?: boolean
  chainNum?: number
}

const Asset = (props: Props) => {
  const { token, icon, symbol, balance, denom, chainNum, ...state } = props
  const { t } = useTranslation()
  const currency = useCurrency()
  const { data: prices, ...pricesState } = useMemoizedPrices()

  const change = props.change || prices?.[denom]?.change || 0

  return (
    <article className={styles.asset} key={token}>
      <section className={styles.details}>
        <TokenIcon token={token} icon={icon} size={50} />

        <div className={styles.details__container}>
          <div>
            <h1 className={styles.symbol}>
              {symbol} {!!chainNum && chainNum > 1 && <span>{chainNum}</span>}
            </h1>
            <h2
              className={change >= 0 ? styles.change__up : styles.change__down}
            >
              {change.toFixed(2)}%
            </h2>
          </div>
          <div className={styles.amount__container}>
            <h1 className={styles.price}>
              {currency.unit} {props.price || prices?.[denom]?.price || 0}
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
        </div>
      </section>
    </article>
  )
}

export default Asset
