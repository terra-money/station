import { useTranslation } from "react-i18next"
import { ProposalResult, useParseProposalType } from "data/queries/gov"
import { useProposalStatusItem } from "data/queries/gov"
import { DateTimeRenderer } from "components/display"
import styles from "./ProposalHeader.module.scss"
import { useNetwork } from "data/wallet"

const ProposalHeader = ({
  proposal,
  chain,
}: {
  proposal: ProposalResult
  chain: string
}) => {
  const { proposal_id, content, status, submit_time } = proposal
  const networks = useNetwork()
  const { t } = useTranslation()
  const type = useParseProposalType(content)
  const { color, label } = useProposalStatusItem(status)
  if (!content) return null
  const { title } = content

  return (
    <header className={styles.header}>
      <section className={styles.meta}>
        <aside>
          {chain && (
            <img src={networks[chain].icon} alt={networks[chain].name} />
          )}
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
