import { Proposal } from "@terra-money/feather.js"
import { FlexColumn } from "components/layout"
import ProposalVotes from "./ProposalVotes"
import ProposalHeader from "./ProposalHeader"
import styles from "./ProposalItem.module.scss"

interface Props {
  proposal: Proposal
  showVotes: boolean
  chain: string
}

const ProposalItem = ({ proposal, showVotes, chain }: Props) => {
  const { id, status } = proposal

  return (
    <FlexColumn gap={36} className={styles.item}>
      <ProposalHeader proposal={proposal} chain={chain} />

      {showVotes && status === Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD ? (
        <ProposalVotes id={id} chain={chain} />
      ) : null}
    </FlexColumn>
  )
}

export default ProposalItem
