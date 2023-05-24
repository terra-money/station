import { useTranslation } from "react-i18next"
import { useProposal } from "data/queries/gov"
import { Auto, Page, Card } from "components/layout"
import useProposalId from "pages/gov/useProposalId"
import ProposalHeader from "pages/gov/ProposalHeader"
import DepositForm from "./DepositForm"

const DepositTx = () => {
  const { t } = useTranslation()
  const { id, chain } = useProposalId()
  const { data: proposal, ...state } = useProposal(id, chain)

  return (
    <Page title={t("Deposit")} backButtonPath={`/proposal/${chain}/${id}`}>
      <Auto
        columns={[
          <Card inputCard>
            <DepositForm />
          </Card>,
          <Card {...state}>
            {proposal && <ProposalHeader proposal={proposal} chain={chain} />}
          </Card>,
        ]}
      />
    </Page>
  )
}

export default DepositTx
