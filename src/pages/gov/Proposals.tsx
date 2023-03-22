import { ProposalStatus, useGetProposalStatusItem } from "data/queries/gov"
import { Tabs } from "components/layout"
import ProposalsByStatus from "./ProposalsByStatus"

const Proposals = () => {
  const getTranslation = useGetProposalStatusItem()

  const tabs = [
    ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD,
    ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD,
    ProposalStatus.PROPOSAL_STATUS_PASSED,
    ProposalStatus.PROPOSAL_STATUS_REJECTED,
  ].map((key) => ({
    key: key,
    tab: getTranslation(key).label,
    children: <ProposalsByStatus status={key} />,
  }))

  return <Tabs tabs={tabs} type="card" />
}

export default Proposals
