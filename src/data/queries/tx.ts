import { QueryKey, useQuery, useQueryClient } from "react-query"
import { atom, useSetRecoilState } from "recoil"
import { queryKey } from "../query"
import { useInterchainLCDClient } from "./lcdClient"

interface LatestTx {
  txhash: string
  chainID: string
  redirectAfterTx?: { label: string; path: string }
  queryKeys?: QueryKey[]
  onSuccess?: () => void
}

export const latestTxState = atom<LatestTx>({
  key: "latestTx",
  default: { txhash: "", chainID: "" },
})

export const isBroadcastingState = atom({
  key: "isBroadcasting",
  default: false,
})

export const useTxInfo = ({ txhash, queryKeys, chainID }: LatestTx) => {
  const setIsBroadcasting = useSetRecoilState(isBroadcastingState)
  const queryClient = useQueryClient()
  const lcd = useInterchainLCDClient()

  return useQuery(
    [queryKey.tx.txInfo, txhash],
    () => lcd.tx.txInfo(txhash, chainID),
    {
      enabled: !!txhash,
      retry: true,
      retryDelay: 1000,
      onSettled: () => setIsBroadcasting(false),
      onSuccess: () => {
        queryKeys?.forEach((queryKey) => {
          queryClient.invalidateQueries(queryKey)
        })
        queryClient.invalidateQueries(queryKey.History)
        queryClient.invalidateQueries(queryKey.bank.balance)
        queryClient.invalidateQueries(queryKey.tx.create)
      },
    }
  )
}
