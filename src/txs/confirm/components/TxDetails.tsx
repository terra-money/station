import { Fragment } from "react"
import { useTranslation } from "react-i18next"
import { Grid } from "components/layout"
import { Dl } from "components/display"
import { ReadMultiple } from "components/token"
import { getIsNativeMsgFromExternal, TxRequest } from "utils/rnModule"
import Message from "./Message"
import styles from "./TxDetails.module.scss"

const TxDetails = ({ tx, origin }: TxRequest) => {
  const { msgs, memo, fee } = tx

  const { t } = useTranslation()

  const fees = fee?.amount.toData()
  const contents = [
    { title: t("Origin"), content: origin },
    { title: t("Fee"), content: fees && <ReadMultiple list={fees} /> },
    { title: t("Memo"), content: memo },
  ]

  return (
    <Grid gap={12}>
      <Dl className={styles.dl}>
        {contents.map(({ title, content }) => {
          if (!content) return null
          return (
            <Fragment key={title}>
              <dt>{title}</dt>
              <dd>{content}</dd>
            </Fragment>
          )
        })}
      </Dl>

      {msgs.map((msg, index) => {
        const isNativeMsgFromExternal = getIsNativeMsgFromExternal(origin)(msg)
        return <Message msg={msg} warn={isNativeMsgFromExternal} key={index} />
      })}
    </Grid>
  )
}

export default TxDetails
