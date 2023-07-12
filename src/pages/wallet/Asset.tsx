import { useTranslation } from "react-i18next"
import { WithFetching } from "components/feedback"
import { Read, TokenIcon } from "components/token"
import { useExchangeRates } from "data/queries/coingecko"
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
  id: string
}

const Asset = (props: Props) => {
  const { token, icon, symbol, balance, denom, decimals, id, ...state } = props
  const { t } = useTranslation()
  const currency = useCurrency()
  const network = useNetwork()
  const chains = props.chains.filter((chain) => !!network[chain])
  const singleNetworkIcon = network[chains[0]]?.icon

  const { data: prices, ...pricesState } = useExchangeRates()
  const { route, setRoute } = useWalletRoute()

  const coinPrice = props.price ?? 0
  const change = props.change ?? 0

  const walletPrice = coinPrice * parseInt(balance ?? "0")

  return (
    <article
      className={styles.asset}
      onClick={() => {
        if (route.path !== Path.coin) {
          setRoute({ path: Path.coin, denom: id, previousPage: route })
        }
      }}
    >
      <section className={styles.details}>
        <div className={styles.token__icon__container}>
          <TokenIcon token={token} icon={icon} size={28} />
          {chains && chains.length === 1 && (
            <img
              src={singleNetworkIcon}
              alt={network[chains[0]]?.name}
              className={styles.chain__icon}
            />
          )}
        </div>
        <div className={styles.details__container}>
          <div className={styles.top__row}>
            <h1 className={styles.symbol}>
              <span className={styles.symbol__name}>{symbol}</span>
              {chains && chains.length > 1 && (
                <span className={styles.chain__num}>{chains.length}</span>
              )}
            </h1>
            <h1 className={styles.price}>
              {currency.symbol}{" "}
              {coinPrice ? (
                <Read
                  {...props}
                  amount={walletPrice}
                  decimals={decimals}
                  fixed={2}
                  denom=""
                  token=""
                />
              ) : (
                <span>—</span>
              )}
            </h1>
          </div>
          <div className={styles.bottom__row}>
            <h2
              className={change >= 0 ? styles.change__up : styles.change__down}
            >
              {change >= 0 ? <PriceUp /> : <PriceDown />} {change.toFixed(2)}%
            </h2>
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
                      <Read
                        {...props}
                        amount={balance}
                        token=""
                        fixed={2}
                        decimals={decimals}
                      />
                    )}
                  </>
                )}
              </WithFetching>{" "}
              <span className={styles.sub__amount}>{symbol}</span>
            </h2>
          </div>
        </div>
      </section>
    </article>
  )
}

export default Asset
