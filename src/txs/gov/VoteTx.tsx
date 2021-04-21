import { useTranslation } from "react-i18next"
import { useProposal } from "data/queries/gov"
import { Auto, Page, Card } from "components/layout"
import useProposalId from "pages/gov/useProposalId"
import ProposalHeader from "pages/gov/ProposalHeader"
import TxContext from "../TxContext"
import VoteForm from "./VoteForm"

const VoteTx = () => {
  const { t } = useTranslation()
  const id = useProposalId()
  const { data: proposal, ...state } = useProposal(id)

  return (
    <Page title={t("Vote")}>
      <Auto
        columns={[
          <Card>
            <TxContext>
              <VoteForm />
            </TxContext>
          </Card>,
          <Card {...state}>
            {proposal && <ProposalHeader proposal={proposal} />}
          </Card>,
        ]}
      />
    </Page>
  )
}

export default VoteTx
