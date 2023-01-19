import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Proposal } from "@terra-money/feather.js"
import { combineState } from "data/query"
import { useProposals, useProposalStatusItem } from "data/queries/gov"
import { useTerraAssets } from "data/Terra/TerraAssets"
import { Col, Card } from "components/layout"
import { Fetching, Empty } from "components/feedback"
import { Toggle } from "components/form"
import ProposalItem from "./ProposalItem"
import GovernanceParams from "./GovernanceParams"
import styles from "./ProposalsByStatus.module.scss"
import { useNetworkName } from "data/wallet"
import ChainFilter from "components/layout/ChainFilter"

const ProposalsByStatus = ({ status }: { status: Proposal.Status }) => {
  const { t } = useTranslation()
  const networkName = useNetworkName()

  const { data: whitelistData, ...whitelistState } = useTerraAssets<{
    [key: string]: number[]
  }>("/station/proposals.json")
  const whitelist = whitelistData?.[networkName]

  const [showAll, setShowAll] = useState(!!whitelist)
  const toggle = () => setShowAll((state) => !state)

  const { data, ...proposalState } = useProposals(status)
  const { label } = useProposalStatusItem(status)

  const state = combineState(whitelistState, proposalState)

  const render = () => {
    if (!(data && whitelistData)) return null

    const proposals =
      status === Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD && !showAll
        ? data.filter(
            ({ prop, chain }) =>
              chain !== "phoenix-1" || whitelist?.includes(prop.id)
          )
        : data

    proposals.sort(
      (a, b) =>
        (b.prop.voting_start_time || b.prop.submit_time).getTime() -
        (a.prop.voting_start_time || a.prop.submit_time).getTime()
    )

    return (
      <>
        <ChainFilter all>
          {(chain) => {
            const filtered = proposals.filter(
              (p) => !chain || p.chain === chain
            )
            return !filtered.length ? (
              <>
                <Card>
                  <Empty>
                    {t("No proposals in {{label}} period", {
                      label: label.toLowerCase(),
                    })}
                  </Empty>
                </Card>
                {chain && <GovernanceParams chain={chain} />}
              </>
            ) : (
              <>
                <section className={styles.list}>
                  {filtered.map(({ prop, chain }, i) => (
                    <Card
                      to={`/proposal/${chain}/${prop.id}`}
                      className={styles.link}
                      key={i}
                    >
                      <ProposalItem
                        proposal={prop}
                        chain={chain}
                        showVotes={
                          status ===
                          Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD
                        }
                      />
                    </Card>
                  ))}
                </section>
                {chain && <GovernanceParams chain={chain} />}
              </>
            )
          }}
        </ChainFilter>
      </>
    )
  }

  return (
    <Fetching {...state}>
      <Col>
        {!!whitelist &&
          status === Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD && (
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
