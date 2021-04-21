import { Fragment, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useInfiniteQuery } from "react-query"
import axios from "axios"
import { queryKey } from "data/query"
import { useAddress } from "data/wallet"
import { useTerraAPIURL } from "data/Terra/TerraAPI"
import { Button } from "components/general"
import { Card, Col, Page } from "components/layout"
import { Empty } from "components/feedback"
import HistoryItem from "./HistoryItem"

const History = () => {
  const { t } = useTranslation()
  const address = useAddress()
  const baseURL = useTerraAPIURL()

  /* query */
  const fetchAccountHistory = useCallback(
    async ({ pageParam = 0 }) => {
      const { data } = await axios.get<AccountHistory>(
        `tx-history/station/${address}`,
        { baseURL, params: { offset: pageParam || undefined } }
      )

      return data
    },
    [address, baseURL]
  )

  const { data, error, fetchNextPage, ...state } = useInfiniteQuery(
    [queryKey.TerraAPI, "history", baseURL, address],
    fetchAccountHistory,
    { getNextPageParam: ({ next }) => next, enabled: !!(address && baseURL) }
  )

  const { hasNextPage, isFetchingNextPage } = state

  const getPages = () => {
    if (!data) return []
    const { pages } = data
    const [{ list }] = data.pages
    return list.length ? pages : []
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
        {pages.map(({ list }, i) => (
          <Fragment key={i}>
            {list.map((item) => (
              <HistoryItem {...item} key={item.txhash} />
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
    <Page {...state} title={t("History")}>
      {render()}
    </Page>
  )
}

export default History
