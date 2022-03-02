import { useTranslation } from "react-i18next"
import { Proposal } from "@terra-money/terra.js"
import { useProposal } from "data/queries/gov"
import { Col, Row, Page, Card, Grid } from "components/layout"
import { useGoBackOnError } from "app/routes"
import ProposalActions from "./ProposalActions"
import ProposalHeader from "./ProposalHeader"
import ProposalDescription from "./ProposalDescription"
import ProposalSummary from "./ProposalSummary"
import ProposalDeposits from "./ProposalDeposits"
import ProposalDepositors from "./ProposalDepositors"
import ProposalVotes from "./ProposalVotes"
import ProposalVotesByValidator from "./ProposalVotesByValidator"
import ProposalParams from "./ProposalParams"
import useProposalId from "./useProposalId"

const ProposalDetails = () => {
  const { t } = useTranslation()

  const id = useProposalId()
  const { data: proposal, ...state } = useProposal(id)

  useGoBackOnError(state)

  const render = () => {
    if (!proposal) return null

    const { status } = proposal

    return (
      <Col>
        <Row>
          <Col span={2}>
            <Card>
              <Grid gap={28}>
                <ProposalHeader proposal={proposal} />
                <ProposalDescription proposal={proposal} />
              </Grid>
            </Card>
          </Col>

          <ProposalSummary proposal={proposal} />
        </Row>

        {status === Proposal.Status.PROPOSAL_STATUS_DEPOSIT_PERIOD ? (
          <Row>
            <Col>
              <ProposalDeposits id={id} card />
            </Col>

            <Col span={2}>
              <ProposalDepositors id={id} />
            </Col>
          </Row>
        ) : (
          status !== Proposal.Status.PROPOSAL_STATUS_REJECTED && (
            <ProposalVotes id={id} card />
          )
        )}

        {status !== Proposal.Status.PROPOSAL_STATUS_DEPOSIT_PERIOD && (
          <ProposalVotesByValidator id={id} />
        )}

        <ProposalParams />
      </Col>
    )
  }

  return (
    <Page
      {...state}
      title={t("Proposal details")}
      extra={proposal && <ProposalActions proposal={proposal} />}
    >
      {render()}
    </Page>
  )
}

export default ProposalDetails
