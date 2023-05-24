import { useTranslation } from "react-i18next"
import { useProposal } from "data/queries/gov"
import { Auto, Page, Card } from "components/layout"
import useProposalId from "pages/gov/useProposalId"
import ProposalHeader from "pages/gov/ProposalHeader"
import VoteForm from "./VoteForm"

const VoteTx = () => {
  const { t } = useTranslation()
  const { id, chain } = useProposalId()
  const { data: proposal, ...state } = useProposal(id, chain)

  return (
    <Page backButtonPath={`/proposal/${chain}/${id}`} title={t("Vote")}>
      <Auto
        columns={[
          <Card inputCard>
            <VoteForm />
          </Card>,
          <Card {...state}>
            {proposal && <ProposalHeader proposal={proposal} chain={chain} />}
          </Card>,
        ]}
      />
    </Page>
  )
}

export default VoteTx
