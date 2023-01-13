import { Fragment } from "react"
import { useQuery } from "react-query"
import axios from "axios"
import { queryKey } from "data/query"
import { useNetwork } from "data/wallet"
import { Card, Col, Page } from "components/layout"
import { Empty } from "components/feedback"
import HistoryItem from "./HistoryItem"
import { useInterchainAddresses } from "auth/hooks/useAddress"

interface Props {
  chainID: string
}

const HistoryList = ({ chainID }: Props) => {
  const addresses = useInterchainAddresses()
  const address = addresses?.[chainID]
  const networks = useNetwork()

  const LIMIT = 100
  const EVENTS = [
    // any tx signed by the user
    "message.sender",
    // any coin received
    "transfer.recipient",
    // any coin sent
    "transfer.sender",
  ]

  /* query */
  const { data: history, ...state } = useQuery(
    [queryKey.History, networks, address, chainID],
    async ({ pageParam = 0 }) => {
      const result: any[] = []
      const txhases: string[] = []

      const requests = await Promise.all(
        EVENTS.map((event) =>
          axios.get<AccountHistory>(`/cosmos/tx/v1beta1/txs`, {
            baseURL: networks[chainID].lcd,
            params: {
              events: `${event}='${address}'`,
              //order_by: "ORDER_BY_DESC",
              "pagination.offset": pageParam || undefined,
              "pagination.reverse": true,
              "pagination.limit": LIMIT,
            },
          })
        )
      )

      for (const { data } of requests) {
        data.tx_responses.forEach((tx) => {
          if (!txhases.includes(tx.txhash)) {
            result.push(tx)
            txhases.push(tx.txhash)
          }
        })
      }

      return result
        .sort((a, b) => Number(b.height) - Number(a.height))
        .slice(0, LIMIT)
    }
  )

  const render = () => {
    if (address && !history) return null

    return !history?.length ? (
      <Card>
        <Empty />
      </Card>
    ) : (
      <Col>
        <Fragment>
          {history.map((item) => (
            <HistoryItem {...item} chain={chainID} key={item.txhash} />
          ))}
        </Fragment>
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
