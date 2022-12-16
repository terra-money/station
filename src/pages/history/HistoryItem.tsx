import { Fragment } from "react"
import { useTranslation } from "react-i18next"
import { FinderLink } from "components/general"
import { Card } from "components/layout"
import { Dl, ToNow } from "components/display"
import { ReadMultiple } from "components/token"
import HistoryMessage from "./HistoryMessage"
import styles from "./HistoryItem.module.scss"
import DateRangeIcon from "@mui/icons-material/DateRange"
import { useNetwork, useNetworkName } from "data/wallet"
import {
  createActionRuleSet,
  createLogMatcherForActions,
  getTxCanonicalMsgs,
} from "@terra-money/log-finder-ruleset"
import { TxInfo } from "@terra-money/feather.js"

const HistoryItem = ({
  txhash,
  timestamp,
  chain,
  ...props
}: AccountHistoryItem & { chain: string }) => {
  const {
    code,
    tx: {
      body: { memo },
      auth_info: {
        fee: { amount: fee },
      },
    },
    raw_log,
  } = props
  const success = code === 0
  const { t } = useTranslation()
  const network = useNetwork()
  const networkName = useNetworkName()

  const data = [
    { title: t("Fee"), content: <ReadMultiple list={fee} /> },
    { title: t("Memo"), content: memo },
    { title: t("Log"), content: !success && raw_log },
  ]

  const ruleset = createActionRuleSet(networkName)
  const logMatcher = createLogMatcherForActions(ruleset)
  const getCanonicalMsgs = (txInfo: TxInfo) => {
    // @ts-expect-error
    const matchedMsg = getTxCanonicalMsgs(txInfo, logMatcher)
    return matchedMsg
      ? matchedMsg
          .map((matchedLog) => matchedLog.map(({ transformed }) => transformed))
          .flat(2)
      : []
  }

  return (
    <Card size="small" bordered>
      <header className={styles.header}>
        <p className={styles.txhash}>
          <span className={styles.chain}>
            <img src={network[chain].icon} alt={chain} />
            {network[chain].name}
          </span>
          <span className={styles.link}>
            <FinderLink chainID={chain} tx short>
              {txhash}
            </FinderLink>
          </span>
        </p>
        <p className={styles.time}>
          <DateRangeIcon />
          <ToNow>{new Date(timestamp)}</ToNow>
        </p>
      </header>

      <div className={styles.msgs}>
        {getCanonicalMsgs({
          txhash,
          timestamp,
          ...props,
        } as any)?.map(
          (msg, index) =>
            msg && <HistoryMessage msg={msg} success={success} key={index} />
        )}
      </div>

      {
        //collapsed && <small>{t("{{collapsed}} more", { collapsed })}</small>
      }

      <footer className={styles.footer}>
        <Dl>
          {data.map(({ title, content }) => {
            if (!content) return null
            return (
              <Fragment key={title}>
                <dt>{title}</dt>
                <dd>{content}</dd>
              </Fragment>
            )
          })}
        </Dl>
      </footer>
    </Card>
  )
}

export default HistoryItem
