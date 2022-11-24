import { useTranslation } from "react-i18next"
import { Proposal } from "@terra-money/station.js"
import { useParseProposalType } from "data/queries/gov"
import { useProposalStatusItem } from "data/queries/gov"
import { ToNow } from "components/display"
import styles from "./ProposalHeader.module.scss"
import { useChains } from "data/queries/chains"

const ProposalHeader = ({
  proposal,
  chain,
}: {
  proposal: Proposal
  chain: string
}) => {
  const { id, content, status, submit_time } = proposal
  const { title } = content

  const chains = useChains()
  const { t } = useTranslation()
  const type = useParseProposalType(content)
  const { color, label } = useProposalStatusItem(status)

  return (
    <header className={styles.header}>
      <section className={styles.meta}>
        <aside>
          {chain && <img src={chains[chain].icon} alt={chains[chain].name} />}
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
