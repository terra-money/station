import { Proposal } from "@terra-money/feather.js"
import { useGetProposalStatusItem } from "data/queries/gov"
import { Tabs } from "components/layout"
import ProposalsByStatus from "./ProposalsByStatus"

const Proposals = () => {
  const getTranslation = useGetProposalStatusItem()

  const tabs = [
    Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD,
    Proposal.Status.PROPOSAL_STATUS_DEPOSIT_PERIOD,
    Proposal.Status.PROPOSAL_STATUS_PASSED,
    Proposal.Status.PROPOSAL_STATUS_REJECTED,
  ].map((key) => ({
    key: Proposal.Status[key],
    tab: getTranslation(key).label,
    children: <ProposalsByStatus status={key} />,
  }))

  return <Tabs tabs={tabs} type="card" />
}

export default Proposals
