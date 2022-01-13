import { FC } from "react"
import { useTranslation } from "react-i18next"
import { Pre } from "components/general"
import { Auto, Card, Grid } from "components/layout"
import { Wrong } from "components/feedback"
import { ReadMultiple } from "components/token"
import decodeTx from "./utils/decodeTx"

const ReadTx: FC<{ tx: string }> = ({ tx: encoded, children }) => {
  const { t } = useTranslation()

  const render = () => {
    const tx = decodeTx(encoded)

    if (!encoded) return <Wrong>{t("Tx is not defined")}</Wrong>
    if (!tx) return <Wrong>{t("Invalid tx")}</Wrong>

    const { body, auth_info } = tx
    const { memo, messages } = body
    const { fee } = auth_info

    const contents = [
      {
        title: t("Messages"),
        content: messages.map((message, index) => (
          <Pre key={index}>{message.toData()}</Pre>
        )),
      },

      { title: t("Memo"), content: memo },
      { title: t("Fee"), content: <ReadMultiple list={fee.amount.toData()} /> },
    ]

    return (
      <Grid gap={20}>
        {contents.map(({ title, content }) => {
          if (!content) return null

          return (
            <article key={title}>
              <h1>{title}</h1>
              {content}
            </article>
          )
        })}
      </Grid>
    )
  }

  return <Auto columns={[<Card>{children}</Card>, <Card>{render()}</Card>]} />
}

export default ReadTx
