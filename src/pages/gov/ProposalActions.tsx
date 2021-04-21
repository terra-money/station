import { useTranslation } from "react-i18next"
import { Proposal } from "@terra-money/terra.js"
import { LinkButton } from "components/general"

const ProposalActions = ({ proposal }: { proposal: Proposal }) => {
  const { t } = useTranslation()
  const { status } = proposal

  return status === Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD ? (
    <LinkButton to="./vote" color="primary" size="small">
      {t("Vote")}
    </LinkButton>
  ) : status === Proposal.Status.PROPOSAL_STATUS_DEPOSIT_PERIOD ? (
    <LinkButton to="./deposit" color="primary" size="small">
      {t("Deposit")}
    </LinkButton>
  ) : null
}

export default ProposalActions
