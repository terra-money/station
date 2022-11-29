import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Proposal } from "@terra-money/terra.js"
import { Col, Row, Card } from "components/layout"
import styles from "./StakedDonut.module.scss"
import ChainFilter from "components/layout/ChainFilter"
import { useNetworkName } from "data/wallet"
import { useProposals, useProposalStatusItem } from "data/queries/gov"
import { useTerraAssets } from "data/Terra/TerraAssets"
import { combineState } from "data/query"
import { Fetching, Empty } from "components/feedback"
import ProposalItem from "../gov/ProposalItem"
import { useDelegations } from "data/queries/staking"
import GovernanceParams from "../gov/GovernanceParams"
import {
  calcDelegationsTotal,
  useInterchainDelegations,
} from "data/queries/staking"
import { useMemoizedCalcValue } from "data/queries/coingecko"

// import { Page, Card, Table, Flex, Grid } from "components/layout";

const StakedDonut = ({ status }: { status: Proposal.Status }) => {
  const { t } = useTranslation()
  const calcValue = useMemoizedCalcValue()

  const { data: delegations, ...delegationsState } = useDelegations()
  const { data: interchainDelegations, ...interChaindelegationsState } =
    useInterchainDelegations()
  console.log(
    "🚀 ~ file: StakedDonut.tsx ~ line 29 ~ StakedDonut ~ interchainDelegations",
    interchainDelegations
  )

  const state = combineState(delegationsState)

  const networkName = useNetworkName()

  const { data: whitelistData, ...whitelistState } = useTerraAssets<{
    [key: string]: number[]
  }>("/station/proposals.json")
  console.log(
    "🚀 ~ file: StakedDonut.tsx ~ line 35 ~ StakedDonut ~ whitelistData",
    whitelistData
  )
  const whitelist = whitelistData?.[networkName]

  const [showAll, setShowAll] = useState(!!whitelist)
  const toggle = () => setShowAll((state) => !state)

  const { data, ...proposalState } = useProposals(status)
  const { label } = useProposalStatusItem(status)

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

  if (!delegations) return null

  const total = calcDelegationsTotal(delegations)

  return (
    <Col span={2}>
      <ChainFilter title="Staked Funds" all>
        {(chain) => {
          const filtered = proposals.filter((p) => !chain || p.chain === chain)
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
                {filtered.map(({ prop, chain }) => (
                  <Card
                    to={`/proposal/${chain}/${prop.id}`}
                    className={styles.link}
                    key={prop.id}
                  >
                    <ProposalItem
                      proposal={prop}
                      chain={chain}
                      showVotes={
                        status === Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD
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
    </Col>
  )
}

export default StakedDonut
