import { useTranslation } from "react-i18next"
import { Proposal } from "@terra-money/terra.js"
import { useParseProposalType } from "data/queries/gov"
import { useProposalStatusItem } from "data/queries/gov"
import { ToNow } from "components/display"
import styles from "./ProposalHeader.module.scss"

const ProposalHeader = ({ proposal }: { proposal: Proposal }) => {
  const { id, content, status, submit_time } = proposal
  const { title } = content

  const { t } = useTranslation()
  const type = useParseProposalType(content)
  const { color, label } = useProposalStatusItem(status)

  return (
    <header className={styles.header}>
      <section className={styles.meta}>
        <aside>
          {id} | {type}
        </aside>
        <strong className={color}>{label}</strong>
      </section>

      <h1 className={styles.title}>{title}</h1>
      <p className={styles.date}>
        {t("Submitted")} <ToNow>{submit_time}</ToNow>
      </p>
    </header>
  )
}

export default ProposalHeader
