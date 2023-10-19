import { ProposalStatus } from "data/queries/gov"
import { useGetProposalStatusItem } from "data/queries/gov"
import { Tabs } from "components/layout"
import ProposalsByStatus from "./ProposalsByStatus"
import { isWallet } from "auth"

const Proposals = () => {
  const getTranslation = useGetProposalStatusItem()

  const tabs = [
    ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD,
    ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD,
    ProposalStatus.PROPOSAL_STATUS_PASSED,
    ProposalStatus.PROPOSAL_STATUS_REJECTED,
  ].map((key) => ({
    key: ProposalStatus[key],
    tab: getTranslation(key).label,
    children: <ProposalsByStatus status={key} />,
  }))

  return <Tabs tabs={tabs} type={isWallet.mobile() ? "filter" : "card"} />
}

export default Proposals
