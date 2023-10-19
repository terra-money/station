import { useState } from "react"
import { useTranslation } from "react-i18next"
import { reverse } from "ramda"
import { combineState } from "data/query"
import {
  useProposals,
  useProposalStatusItem,
  ProposalStatus,
} from "data/queries/gov"
import { useTerraAssets } from "data/Terra/TerraAssets"
import { Col, Card } from "components/layout"
import { Fetching, Empty } from "components/feedback"
import ProposalItem from "./ProposalItem"
import GovernanceParams from "./GovernanceParams"
import styles from "./ProposalsByStatus.module.scss"
import { useNetworkName } from "data/wallet"
import { isWallet } from "auth"
import PageLoading from "auth/modules/PageLoading"

const ProposalsByStatus = ({ status }: { status: ProposalStatus }) => {
  const { t } = useTranslation()
  const networkName = useNetworkName()

  const { data: whitelistData, ...whitelistState } = useTerraAssets<{
    [key: string]: number[]
  }>("/station/proposals.json")
  const whitelist = whitelistData?.[networkName]

  const [showAll] = useState(true)

  const { data, ...proposalState } = useProposals(status)
  const { label } = useProposalStatusItem(status)

  const state = combineState(whitelistState, proposalState)

  const render = () => {
    if (!(data && whitelistData))
      return isWallet.mobileNative() ? <PageLoading inCard /> : null

    const proposals =
      status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD && !showAll
        ? data.filter(({ proposal_id }) =>
            whitelist?.includes(Number(proposal_id))
          )
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
              to={`/proposal/${item.proposal_id}`}
              className={styles.link}
              key={item.proposal_id}
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
      <Col>{render()}</Col>
    </Fetching>
  )
}

export default ProposalsByStatus
