import { useState } from "react"
import { useTranslation } from "react-i18next"
import { reverse } from "ramda"
import { Proposal } from "@terra-money/terra.js"
import { combineState, useIsClassic } from "data/query"
import { useProposals, useProposalStatusItem } from "data/queries/gov"
import { useTerraAssets } from "data/Terra/TerraAssets"
import { Col, Card } from "components/layout"
import { Fetching, Empty } from "components/feedback"
import { Toggle } from "components/form"
import ProposalItem from "./ProposalItem"
import GovernanceParams from "./GovernanceParams"
import styles from "./ProposalsByStatus.module.scss"

const ProposalsByStatus = ({ status }: { status: Proposal.Status }) => {
  const { t } = useTranslation()
  const isClassic = useIsClassic()

  const [showAll, setShowAll] = useState(!isClassic)
  const toggle = () => setShowAll((state) => !state)

  const { data: whitelist, ...whitelistState } = useTerraAssets<number[]>(
    "/station/proposals.json"
  )

  const { data, ...proposalState } = useProposals(status)
  const { label } = useProposalStatusItem(status)

  const state = combineState(whitelistState, proposalState)

  const render = () => {
    if (!(data && whitelist)) return null

    const proposals =
      status === Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD && !showAll
        ? data.filter(({ id }) => whitelist.includes(id))
        : data

    return !proposals.length ? (
      <>
        <Card>
          <Empty>
            {t("No proposals in {{label}} period", {
              label: label.toLowerCase(),
            })}
          </Empty>
        </Card>
        <GovernanceParams />
      </>
    ) : (
      <>
        <section className={styles.list}>
          {reverse(proposals).map((item) => (
            <Card
              to={`/proposal/${item.id}`}
              className={styles.link}
              key={item.id}
            >
              <ProposalItem proposal={item} showVotes={!showAll} />
            </Card>
          ))}
        </section>

        <GovernanceParams />
      </>
    )
  }

  return (
    <Fetching {...state}>
      <Col>
        {isClassic && status === Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD && (
          <section>
            <Toggle checked={showAll} onChange={toggle}>
              {t("Show all")}
            </Toggle>
          </section>
        )}

        {render()}
      </Col>
    </Fetching>
  )
}

export default ProposalsByStatus
