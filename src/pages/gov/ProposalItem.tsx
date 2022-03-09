import { Proposal } from "@terra-money/terra.js"
import { FlexColumn } from "components/layout"
import ProposalVotes from "./ProposalVotes"
import ProposalHeader from "./ProposalHeader"
import styles from "./ProposalItem.module.scss"

const ProposalItem = ({ proposal }: { proposal: Proposal }) => {
  const { id, status } = proposal

  return (
    <FlexColumn gap={36} className={styles.item}>
      <ProposalHeader proposal={proposal} />

      {status === Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD ? (
        <ProposalVotes id={id} />
      ) : null}
    </FlexColumn>
  )
}

export default ProposalItem
