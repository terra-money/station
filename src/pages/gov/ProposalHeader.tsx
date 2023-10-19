import { useTranslation } from "react-i18next"
import {
  ProposalResult,
  useParseProposalType,
  useProposalStatusItem,
} from "data/queries/gov"
import DateTimeRenderer from "components/display/DateTimeRenderer"
import styles from "./ProposalHeader.module.scss"

const ProposalHeader = ({ proposal }: { proposal: ProposalResult }) => {
  const { proposal_id, content, status, submit_time } = proposal
  const { title } = content

  const { t } = useTranslation()
  const type = useParseProposalType(content)
  const { color, label } = useProposalStatusItem(status)

  return (
    <header className={styles.header}>
      <section className={styles.meta}>
        <aside>
          {proposal_id} | {type}
        </aside>
        <strong className={color}>{label}</strong>
      </section>

      <h1 className={styles.title}>{title}</h1>
      <p className={styles.date}>
        {t("Submitted")}{" "}
        <DateTimeRenderer format={"localestring"}>
          {submit_time}
        </DateTimeRenderer>
      </p>
    </header>
  )
}

export default ProposalHeader
