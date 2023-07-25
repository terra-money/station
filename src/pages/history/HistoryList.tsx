import { Fragment } from "react"
import { useQueries } from "react-query"
import axios from "axios"
import { combineState, queryKey } from "data/query"
import { useNetwork } from "data/wallet"
import { Card, Col, Page } from "components/layout"
import { Empty } from "components/feedback"
import HistoryItem from "./HistoryItem"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { isTerraChain } from "utils/chain"

interface Props {
  chainID?: string
}

interface PaginationKeys {
  limit: string
  offset: string
  reverse: string
}

/**
 * Returns pagination keys for the given chain. Switched by cosmos_sdk
 * version in the future, isTerra for now.
 *
 * @param isTerra boolean based on chain-id.  True if Terra, false if not.
 */
function getPaginationKeys(isTerra: boolean): PaginationKeys {
  if (isTerra) {
    return {
      limit: "limit",
      offset: "page",
      reverse: "orderBy",
    }
  } else {
    return {
      limit: "pagination.limit",
      offset: "pagination.offset",
      reverse: "pagination.reverse",
    }
  }
}

const HistoryList = ({ chainID }: Props) => {
  const addresses = useInterchainAddresses()
  const networks = useNetwork()

  const LIMIT = 75
  const EVENTS = [
    // any tx signed by the user
    "message.sender",
    // any coin received
    "transfer.recipient",
    // any coin sent
    "transfer.sender",
  ]

  const historyData = useQueries(
    Object.keys(addresses ?? {})
      .filter((chain) => !chainID || chain === chainID)
      .map((chain) => {
        const address = chain && addresses?.[chain]

        const isTerra = isTerraChain(chain)

        // return pagination keys by network.
        const paginationKeys = getPaginationKeys(isTerra)

        return {
          queryKey: [queryKey.History, networks?.[chain]?.lcd, address],
          queryFn: async () => {
            const result: any[] = []
            const txhases: string[] = []

            if (!networks?.[chain]?.lcd) {
              return result
            }

            const requests = await Promise.all(
              EVENTS.map((event) => {
                return axios.get<AccountHistory>(`/cosmos/tx/v1beta1/txs`, {
                  baseURL: networks[chain].lcd,
                  params: {
                    events: `${event}='${address}'`,
                    //order_by: "ORDER_BY_DESC",
                    [paginationKeys.offset]: 0 || undefined,
                    [paginationKeys.reverse]: isTerra ? 2 : true,
                    [paginationKeys.limit]: LIMIT,
                  },
                })
              })
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
              .map((tx) => ({ ...tx, chain }))
          },
        }
      })
  )

  const state = combineState(...historyData)
  const history = historyData
    .reduce((acc, { data }) => (data ? [...acc, ...data] : acc), [] as any[])
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, LIMIT)

  const render = () => {
    if (addresses && !history) return null

    return !history?.length ? (
      <Card>
        <Empty />
      </Card>
    ) : (
      <Col>
        <Fragment>
          {history.map((item) => (
            <HistoryItem {...item} key={item.txhash} />
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
