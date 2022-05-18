import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Proposal } from "@terra-money/terra.js"
import { useGetProposalStatusItem } from "data/queries/gov"
import { Grid, Tabs } from "components/layout"
import { Checkbox } from "components/form"
import ProposalsByStatus from "./ProposalsByStatus"

const Proposals = () => {
  const { t } = useTranslation()
  const getTranslation = useGetProposalStatusItem()
  const [showAll, setShowAll] = useState(false)

  const tabs = [
    Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD,
    Proposal.Status.PROPOSAL_STATUS_DEPOSIT_PERIOD,
    Proposal.Status.PROPOSAL_STATUS_PASSED,
    Proposal.Status.PROPOSAL_STATUS_REJECTED,
  ].map((key) => ({
    key: Proposal.Status[key],
    tab: getTranslation(key).label,
    children: <ProposalsByStatus showAll={showAll} status={key} />,
  }))

  return (
    <Grid gap={8}>
      <Checkbox checked={showAll} onChange={() => setShowAll(!showAll)}>
        {t("Show all")}
      </Checkbox>
      <Tabs tabs={tabs} type="card" />
    </Grid>
  )
}

export default Proposals
