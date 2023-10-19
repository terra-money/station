import { FlexColumn } from "components/layout"
import ProposalVotes from "./ProposalVotes"
import ProposalHeader from "./ProposalHeader"
import styles from "./ProposalItem.module.scss"
import { ProposalResult, ProposalStatus } from "data/queries/gov"

interface Props {
  proposal: ProposalResult
  showVotes: boolean
}

const ProposalItem = ({ proposal, showVotes }: Props) => {
  const { proposal_id, status } = proposal

  return (
    <FlexColumn gap={36} className={styles.item}>
      <ProposalHeader proposal={proposal} />

      {showVotes && status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD ? (
        <ProposalVotes id={Number(proposal_id)} />
      ) : null}
    </FlexColumn>
  )
}

export default ProposalItem
