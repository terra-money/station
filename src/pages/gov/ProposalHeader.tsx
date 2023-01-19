import { useTranslation } from "react-i18next"
import { Proposal } from "@terra-money/feather.js"
import { useParseProposalType } from "data/queries/gov"
import { useProposalStatusItem } from "data/queries/gov"
import { ToNow } from "components/display"
import styles from "./ProposalHeader.module.scss"
import { useNetwork } from "data/wallet"

const ProposalHeader = ({
  proposal,
  chain,
}: {
  proposal: Proposal
  chain: string
}) => {
  const { id, content, status, submit_time } = proposal
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
