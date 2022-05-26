import { useRecoilValue } from "recoil"
import { useTranslation } from "react-i18next"
import { has } from "utils/num"
import { currencyState } from "data/settings/Currency"
import { WithFetching } from "components/feedback"
import { Read, TokenIcon } from "components/token"
import AssetActions from "./AssetActions"
import styles from "./Asset.module.scss"
import { useNavigate } from "react-router-dom"
import is from "auth/scripts/is"

export interface Props extends TokenItem, QueryState {
  balance?: Amount
  value?: Value
}

const Asset = (props: Props) => {
  const { token, icon, symbol, balance, value, ...state } = props
  const { t } = useTranslation()
  const navigate = useNavigate()
  const currency = useRecoilValue(currencyState)

  const toSend = (tokenName: string) => navigate(`/send?token=${tokenName}`)

  return (
    <article className={styles.asset} key={token}>
      <section className={styles.details}>
        <TokenIcon token={token} icon={icon} size={22} />

        <div className={styles.detailsContainer}>
          <h1 className={styles.symbol}>{symbol}</h1>
          <div
            className={styles.amountContainer}
            onClick={() => {
              if (is.mobile() && has(balance)) {
                toSend(token)
              }
            }}
          >
            <h2 className={styles.amount}>
              <WithFetching {...state} height={1}>
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
              </WithFetching>
            </h2>

            {token !== currency && has(balance) && has(value) && (
              <p className={styles.value}>
                <Read amount={value} token={currency} auto approx />
              </p>
            )}
          </div>
        </div>
      </section>

      <AssetActions {...props} />
    </article>
  )
}

export default Asset
