import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Proposal } from "@terra-money/terra.js"
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
import PaginationButtons from "components/layout/PaginationButtons"
import { ProposalStatus } from "@terra-money/terra.proto/cosmos/gov/v1beta1/gov"

interface PaginationState {
  key: string
  stack: string[]
  status: ProposalStatus
  total: number
}

const ProposalsByStatus = ({ status }: { status: Proposal.Status }) => {
  const { t } = useTranslation()
  const networkName = useNetworkName()

  const { data: whitelistData, ...whitelistState } = useTerraAssets<{
    [key: string]: number[]
  }>("/station/proposals.json")
  const whitelist = whitelistData?.[networkName]

  const [showAll, setShowAll] = useState(!!whitelist)
  const toggle = () => setShowAll((state) => !state)

  const pagination = 6
  const [paginationState, setPaginationState] = useState<PaginationState>()
  const key = (paginationState && paginationState.key) || ""
  const pageStack = (paginationState && paginationState.stack) || []
  const page = pageStack.length + 1
  const total = (paginationState && paginationState.total) || 0

  /* reset pagination on status change */
  useEffect(() => {
    const pagination = JSON.parse(
      window.localStorage.getItem("pagination-gov") || "{}"
    )

    setPaginationState(
      pagination.status === status
        ? pagination
        : {
            key: "",
            stack: [],
            status: status,
            total: 0,
          }
    )
  }, [status])

  useEffect(() => {
    window.localStorage.setItem(
      "pagination-gov",
      JSON.stringify(paginationState)
    )
  }, [paginationState])

  const { data, ...proposalState } = useProposals(status, {
    "pagination.count_total": "true",
    "pagination.reverse": "true",
    "pagination.limit": String(pagination),
    "pagination.key": key,
  })
  const [proposalData, paginationData] = data || []

  if (
    paginationData &&
    paginationData.total > 0 &&
    paginationData.total !== total
  ) {
    setPaginationState(
      Object.assign({}, paginationState, { total: paginationData.total })
    )
  }

  const { label } = useProposalStatusItem(status)

  const state = combineState(whitelistState, proposalState)

  /* pagination */
  const handleNext = () => {
    if (!(paginationState && paginationData && paginationData.next_key))
      return null
    if (paginationData.next_key === key) return

    setPaginationState(
      Object.assign({}, paginationState, {
        stack: [...pageStack, paginationData.next_key],
        key: paginationData.next_key,
        status: status,
        page: page + 1,
      })
    )
  }

  const handlePrevious = () => {
    setPaginationState(
      Object.assign({}, paginationState, {
        stack: pageStack.slice(0, pageStack.length - 1),
        key: pageStack.reverse()[1],
        status: status,
        page: page - 1,
      })
    )
  }

  const renderPagination = () => {
    if (!(pagination && paginationData)) return null
    const recordTotal = Math.ceil(total / pagination)

    if (!recordTotal || recordTotal === 1) return null
    const prevPage = page > 1 ? () => handlePrevious() : undefined
    const nextPage = page < total ? () => handleNext() : undefined

    return (
      <footer className={styles.pagination}>
        <PaginationButtons
          current={page}
          total={recordTotal}
          onPrev={prevPage}
          onNext={nextPage}
        />
      </footer>
    )
  }

  const render = () => {
    if (!(proposalData && whitelistData)) return null

    const proposals =
      status === Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD && !showAll
        ? proposalData.filter(({ id }) => whitelist?.includes(id))
        : proposalData

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
          {proposals.map((item) => (
            <Card
              to={`/proposal/${item.id}`}
              className={styles.link}
              key={item.id}
            >
              <ProposalItem proposal={item} showVotes={!showAll} />
            </Card>
          ))}
        </section>

        {renderPagination()}

        <GovernanceParams />
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
