import { QueryKey, useQuery, useQueryClient } from "react-query"
import { atom, useSetRecoilState } from "recoil"
import { queryKey } from "../query"
import { useLCDClient } from "../Terra/lcdClient"

interface LatestTx {
  txhash: string
  redirectAfterTx?: { label: string; path: string }
  queryKeys?: QueryKey[]
}

export const latestTxState = atom<LatestTx>({
  key: "latestTx",
  default: { txhash: "" },
})

export const isBroadcastingState = atom({
  key: "isBroadcasting",
  default: false,
})

export const useTxInfo = ({ txhash, queryKeys }: LatestTx) => {
  const setIsBroadcasting = useSetRecoilState(isBroadcastingState)
  const queryClient = useQueryClient()
  const lcd = useLCDClient()

  return useQuery([queryKey.tx.txInfo, txhash], () => lcd.tx.txInfo(txhash), {
    enabled: !!txhash,
    retry: true,
    retryDelay: 1000,
    onSettled: () => setIsBroadcasting(false),
    onSuccess: () => {
      queryKeys?.forEach((queryKey) => {
        queryClient.invalidateQueries(queryKey)
      })

      queryClient.invalidateQueries(queryKey.bank.balance)
      queryClient.invalidateQueries(queryKey.tx.create)
    },
  })
}
