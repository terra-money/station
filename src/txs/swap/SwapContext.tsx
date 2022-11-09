import { PropsWithChildren } from "react"
import createContext from "utils/createContext"
import { combineState } from "data/query"
import { useActiveDenoms } from "data/queries/coingecko"
import { TerraContracts } from "data/Terra/TerraAssets"
import { useCW20Pairs } from "data/Terra/TerraAssets"
import { useTerraContracts } from "data/Terra/TerraAssets"
import { Fetching } from "components/feedback"

interface Swap {
  activeDenoms: Denom[]
  pairs: CW20Pairs
  contracts?: TerraContracts
}

export const [useSwap, SwapProvider] = createContext<Swap>("useSwap")

const SwapContext = ({ children }: PropsWithChildren<{}>) => {
  const { data: activeDenoms, ...activeDenomsState } = useActiveDenoms()
  const { data: pairs, ...cw20PairsState } = useCW20Pairs()
  const { data: contracts, ...contractsState } = useTerraContracts()

  const state = combineState(activeDenomsState, contractsState, cw20PairsState)

  const render = () => {
    if (!(activeDenoms && pairs && contracts)) return null
    const value = { activeDenoms, pairs, contracts }
    return <SwapProvider value={value}>{children}</SwapProvider>
  }

  return !state.isSuccess ? null : <Fetching {...state}>{render()}</Fetching>
}

export default SwapContext
