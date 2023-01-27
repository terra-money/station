import { useTranslation } from "react-i18next"
import { LinkButton } from "components/general"
import { ProposalResult, ProposalStatus } from "data/queries/gov"

const ProposalActions = ({ proposal }: { proposal: ProposalResult }) => {
  const { t } = useTranslation()
  const { status } = proposal

  return status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD ? (
    <LinkButton to="./vote" color="primary" size="small">
      {t("Vote")}
    </LinkButton>
  ) : status === ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD ? (
    <LinkButton to="./deposit" color="primary" size="small">
      {t("Deposit")}
    </LinkButton>
  ) : null
}

export default ProposalActions
