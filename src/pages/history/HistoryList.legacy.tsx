import { Fragment, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useInfiniteQuery } from "react-query"
import axios from "axios"
import { queryKey } from "data/query"
import { useNetwork } from "data/wallet"
import { Button } from "components/general"
import { Card, Col, Page } from "components/layout"
import { Empty } from "components/feedback"
import HistoryItem from "./HistoryItem"
import { useInterchainAddresses } from "auth/hooks/useAddress"

interface Props {
  chainID: string
}

const HistoryList = ({ chainID }: Props) => {
  const { t } = useTranslation()
  const addresses = useInterchainAddresses()
  const address = addresses?.[chainID]
  const networks = useNetwork()

  const LIMIT = 10

  /* query */
  const fetchAccountHistory = useCallback(
    async ({ pageParam = 0 }) => {
      const { data } = await axios.get<AccountHistory>(
        `/cosmos/tx/v1beta1/txs?events=message.sender=%27${address}%27&pagination.reverse=true&order_by=ORDER_BY_DESC&pagination.limit=${LIMIT}`,
        {
          baseURL: networks[chainID].lcd,
          params: { "pagination.offset": pageParam || undefined },
        }
      )

      return {
        ...data,
        next:
          Number(data.pagination.total) > pageParam + LIMIT &&
          pageParam + LIMIT,
      }
    },
    [address, networks, chainID]
  )

  const { data, error, fetchNextPage, ...state } = useInfiniteQuery(
    [queryKey.TerraAPI, "history", networks, address, chainID],
    fetchAccountHistory,
    {
      getNextPageParam: ({ next }) => next,
      enabled: !!(address && networks[chainID]),
    }
  )

  const { hasNextPage, isFetchingNextPage } = state

  const getPages = () => {
    if (!data) return []
    const { pages } = data
    const [{ tx_responses }] = pages
    return tx_responses.length ? pages : []
  }

  const pages = getPages()

  const render = () => {
    if (address && !data) return null

    return !pages.length ? (
      <Card>
        <Empty />
      </Card>
    ) : (
      <Col>
        {pages.map(({ tx_responses }, i) => (
          <Fragment key={i}>
            {tx_responses.map((item) => (
              <HistoryItem {...item} chain={chainID} key={item.txhash} />
            ))}
          </Fragment>
        ))}

        <Button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
          loading={isFetchingNextPage}
          block
        >
          {isFetchingNextPage
            ? t("Loading more...")
            : hasNextPage
            ? t("Load more")
            : t("Nothing more to load")}
        </Button>
      </Col>
    )
  }

  return (
    <Page {...state} invisible>
      {render()}
    </Page>
  )
}

export default HistoryList
