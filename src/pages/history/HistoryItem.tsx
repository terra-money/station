import { Fragment } from "react"
import { useTranslation } from "react-i18next"
import { FinderLink } from "components/general"
import { Card } from "components/layout"
import { Dl, ToNow } from "components/display"
import { ReadMultiple } from "components/token"
import HistoryMessage from "./HistoryMessage"
import styles from "./HistoryItem.module.scss"

const HistoryItem = ({ txhash, timestamp, ...props }: AccountHistoryItem) => {
  const { success, msgs, collapsed, fee, memo, raw_log } = props
  const { t } = useTranslation()

  const data = [
    { title: t("Fee"), content: <ReadMultiple list={fee} /> },
    { title: t("Memo"), memo },
    { title: t("Log"), content: !success && raw_log },
  ]

  return (
    <Card
      title={
        <FinderLink tx short>
          {txhash}
        </FinderLink>
      }
      extra={<ToNow>{new Date(timestamp)}</ToNow>}
      size="small"
      bordered
    >
      {msgs?.map((msg, index) => (
        <HistoryMessage msg={msg} success={success} key={index} />
      ))}

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
