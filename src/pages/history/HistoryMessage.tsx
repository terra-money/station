import { last } from "ramda"
import { sentenceCase } from "sentence-case"
import { Tag } from "components/display"
import TxMessage from "app/containers/TxMessage"
import styles from "./HistoryMessage.module.scss"

interface Props {
  success: boolean
  msg: TxMessage
}

const HistoryMessage = ({ success, msg }: Props) => {
  const { msgType, canonicalMsg } = msg
  const type = last(msgType.split("/"))

  return (
    <div className={styles.component}>
      {type && (
        <Tag color={success ? "info" : "danger"}>{sentenceCase(type)}</Tag>
      )}

      <section>
        {canonicalMsg.map((text) => (
          <TxMessage className={styles.message} key={text}>
            {text}
          </TxMessage>
        ))}
      </section>
    </div>
  )
}

export default HistoryMessage
