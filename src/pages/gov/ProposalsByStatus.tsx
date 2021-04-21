import { useTranslation } from "react-i18next"
import { reverse } from "ramda"
import { Proposal } from "@terra-money/terra.js"
import { useProposals, useProposalStatusItem } from "data/queries/gov"
import { Col, Card } from "components/layout"
import { Fetching, Empty } from "components/feedback"
import ProposalItem from "./ProposalItem"
import GovernanceParams from "./GovernanceParams"
import styles from "./ProposalsByStatus.module.scss"

const ProposalsByStatus = ({ status }: { status: Proposal.Status }) => {
  const { t } = useTranslation()
  const { data: proposals, ...state } = useProposals(status)
  const { label } = useProposalStatusItem(status)

  const render = () => {
    if (!proposals) return null

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
