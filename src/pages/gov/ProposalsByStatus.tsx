import { useTranslation } from "react-i18next"
import {
  ProposalResult,
  ProposalStatus,
  useProposals,
  useProposalStatusItem,
} from "data/queries/gov"
import { Col, Card } from "components/layout"
import { Fetching, Empty } from "components/feedback"
import ProposalItem from "./ProposalItem"
import GovernanceParams from "./GovernanceParams"
import styles from "./ProposalsByStatus.module.scss"
import ChainFilter from "components/layout/ChainFilter"
import { combineState } from "data/query"

const ProposalsByStatus = ({ status }: { status: ProposalStatus }) => {
  const { t } = useTranslation()
  const proposalsResult = useProposals(status)
  const proposals = proposalsResult.reduce(
    (acc, { data }) => (data ? [...acc, ...data] : acc),
    [] as { prop: ProposalResult; chain: string }[]
  )

  const proposalState = combineState(...proposalsResult)
  const { label } = useProposalStatusItem(status)

  const render = () => {
    if (!proposals) return null

    proposals.sort(
      (a, b) =>
        new Date(b.prop.voting_start_time || b.prop.submit_time).getTime() -
        new Date(a.prop.voting_start_time || a.prop.submit_time).getTime()
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
                      to={`/proposal/${chain}/${prop.proposal_id}`}
                      className={styles.link}
                      key={i}
                    >
                      <ProposalItem
                        proposal={prop}
                        chain={chain}
                        showVotes={
                          status ===
                          ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD
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
    <Fetching {...proposalState}>
      <Col>{render()}</Col>
    </Fetching>
  )
}

export default ProposalsByStatus
