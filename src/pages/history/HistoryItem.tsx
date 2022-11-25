import { Fragment } from "react"
import { useTranslation } from "react-i18next"
import { FinderLink } from "components/general"
import { Card } from "components/layout"
import { Dl, ToNow } from "components/display"
import { ReadMultiple } from "components/token"
import HistoryMessage from "./HistoryMessage"
import styles from "./HistoryItem.module.scss"
import { useChains } from "data/queries/chains"
import DateRangeIcon from "@mui/icons-material/DateRange"

const HistoryItem = ({
  txhash,
  timestamp,
  chain,
  ...props
}: AccountHistoryItem & { chain: string }) => {
  const { success, msgs, collapsed, fee, memo, raw_log } = props
  const { t } = useTranslation()
  const chains = useChains()

  const data = [
    { title: t("Fee"), content: <ReadMultiple list={fee} /> },
    { title: t("Memo"), content: memo },
    { title: t("Log"), content: !success && raw_log },
  ]

  return (
    <Card size="small" bordered>
      <header className={styles.header}>
        <p className={styles.txhash}>
          <span className={styles.chain}>
            <img src={chains[chain].icon} alt={chain} />
            {chains[chain].name}
          </span>
          <span className={styles.link}>
            <FinderLink tx short>
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
        {msgs?.map((msg, index) => (
          <HistoryMessage msg={msg} success={success} key={index} />
        ))}
      </div>

      {collapsed && <small>{t("{{collapsed}} more", { collapsed })}</small>}

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
