import { FlexColumn } from "components/layout"
import ProposalVotes from "./ProposalVotes"
import ProposalHeader from "./ProposalHeader"
import styles from "./ProposalItem.module.scss"
import { ProposalResult, ProposalStatus } from "data/queries/gov"

interface Props {
  proposal: ProposalResult
  showVotes: boolean
  chain: string
}

const ProposalItem = ({ proposal, showVotes, chain }: Props) => {
  const { proposal_id, status } = proposal

  return (
    <FlexColumn gap={36} className={styles.item}>
      <ProposalHeader proposal={proposal} chain={chain} />

      {showVotes && status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD ? (
        <ProposalVotes id={proposal_id} chain={chain} />
      ) : null}
    </FlexColumn>
  )
}

export default ProposalItem
