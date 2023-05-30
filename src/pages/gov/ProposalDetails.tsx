import { useTranslation } from "react-i18next"
import { ProposalStatus, useProposal } from "data/queries/gov"
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

  const { id, chain } = useProposalId()
  const { data: proposal, ...state } = useProposal(id, chain)

  useGoBackOnError(state)

  if (!proposal) {
    return null
  }
  const { status } = proposal

  const render = () => {
    return (
      <Col>
        <Row>
          <Col span={2}>
            <Card>
              <Grid gap={28}>
                <ProposalHeader proposal={proposal} chain={chain} />
                <ProposalDescription proposal={proposal} />
              </Grid>
            </Card>
          </Col>
          <ProposalSummary proposal={proposal} />
        </Row>

        {status === ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD ? (
          <Row>
            <Col>
              <ProposalDeposits id={id} chain={chain} card />
            </Col>

            <Col span={2}>
              <ProposalDepositors id={id} chain={chain} />
            </Col>
          </Row>
        ) : (
          status !== ProposalStatus.PROPOSAL_STATUS_REJECTED && (
            <ProposalVotes id={id} chain={chain} card />
          )
        )}

        {status !== ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD && (
          <ProposalVotesByValidator id={id} />
        )}

        <ProposalParams chain={chain} />
      </Col>
    )
  }

  return (
    <Page
      {...state}
      title={t("Proposal details")}
      extra={proposal && <ProposalActions proposal={proposal} />}
      backButtonPath={`/gov#${status}`}
    >
      {render()}
    </Page>
  )
}

export default ProposalDetails
