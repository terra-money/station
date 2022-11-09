import { useTranslation } from "react-i18next"
import { WithFetching } from "components/feedback"
import { Read, TokenIcon } from "components/token"
import { useMemoizedPrices } from "data/queries/coingecko"
import styles from "./Asset.module.scss"
import { combineState } from "data/query"
import { useCurrency } from "data/settings/Currency"

export interface Props extends TokenItem, QueryState {
  balance?: Amount
  hideActions?: boolean
  denom: string
}

const Asset = (props: Props) => {
  const { token, icon, symbol, balance, hideActions, denom, ...state } = props
  const { t } = useTranslation()
  const currency = useCurrency()
  const { data: prices, ...pricesState } = useMemoizedPrices()

  return (
    <article className={styles.asset} key={token}>
      <section className={styles.details}>
        <TokenIcon token={token} icon={icon} size={50} />

        <div className={styles.details__container}>
          <div>
            <h1 className={styles.symbol}>{symbol}</h1>
            <h2 className={styles.change}>+3.02%</h2>
          </div>
          <div className={styles.amount__container}>
            <h1 className={styles.price}>
              {currency.unit} {prices?.[denom] || 0}
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
