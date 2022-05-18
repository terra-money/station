import { useTranslation } from "react-i18next"
import { reverse } from "ramda"
import { Proposal } from "@terra-money/terra.js"
import { combineState } from "data/query"
import { useProposals, useProposalStatusItem } from "data/queries/gov"
import { useTerraAssets } from "data/Terra/TerraAssets"
import { Col, Card } from "components/layout"
import { Fetching, Empty } from "components/feedback"
import ProposalItem from "./ProposalItem"
import GovernanceParams from "./GovernanceParams"
import styles from "./ProposalsByStatus.module.scss"

const ProposalsByStatus = ({
  status,
  showAll,
}: {
  status: Proposal.Status
  showAll: boolean
}) => {
  const { t } = useTranslation()

  const { data: whitelist, ...whitelistState } = useTerraAssets<number[]>(
    "/station/proposals.json"
  )

  const { data, ...proposalState } = useProposals(status)
  const { label } = useProposalStatusItem(status)

  const state = combineState(whitelistState, proposalState)

  const render = () => {
    if (!(data && whitelist)) return null

    const proposals =
      status === Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD
        ? data.filter(({ id }) => (showAll ? true : whitelist.includes(id)))
        : data

    return !proposals.length ? (
      <Col>
        <Card>
          <Empty>
            {t("No proposals in {{label}} period", {
              label: label.toLowerCase(),
            })}
          </Empty>
        </Card>
        <GovernanceParams />
      </Col>
    ) : (
      <Col>
        <section className={styles.list}>
          {reverse(proposals).map((item) => (
            <Card
              to={`/proposal/${item.id}`}
              className={styles.link}
              key={item.id}
            >
              <ProposalItem proposal={item} />
            </Card>
          ))}
        </section>

        <GovernanceParams />
      </Col>
    )
  }

  return <Fetching {...state}>{render()}</Fetching>
}

export default ProposalsByStatus
