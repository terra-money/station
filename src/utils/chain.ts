import { useExchangeRates } from "data/queries/coingecko"
import { useDisplayChains } from "./localStorage/hooks"
import { AccAddress } from "@terra-money/feather.js"
import { useBankBalance } from "data/queries/bank"
import { useNativeDenoms } from "data/token"
import { useNetworkName } from "data/wallet"

type ChainId = string
type ChainPrefix = string

export const isTerraChain = (id: ChainId | ChainPrefix) =>
  id?.startsWith("phoenix-") || id?.startsWith("pisco-") || id === "terra"

export const isOsmosisChain = (id: ChainId | ChainPrefix) =>
  id?.startsWith("osmosis-") || id === "osmo"

export const useChainsByAssetValue = () => {
  const coins = useBankBalance()
  const readNativeDenom = useNativeDenoms()
  const { data: prices } = useExchangeRates()

  const coinValues = coins?.map(({ amount, denom, chain }) => {
    const { token, decimals, isNonWhitelisted } = readNativeDenom(denom)
    return {
      chain,
      value:
        (parseInt(amount) *
          (isNonWhitelisted ? 0 : prices?.[token]?.price ?? 0)) /
        10 ** decimals,
    }
  })

  const aggregatedCoinValues = coinValues?.reduce<{
    [key: string]: { chain: string; value: number }
  }>((acc, { chain, value }) => {
    if (!acc[chain]) acc[chain] = { chain, value: 0 }
    acc[chain].value += value
    return acc
  }, {})

  return Object.values(aggregatedCoinValues ?? {}).sort(
    (a, b) => b.value - a.value
  )
}

export const useSortedDisplayChains = () => {
  const chains = useChainsByAssetValue()
  const { displayChains } = useDisplayChains()
  const sorted = chains
    .filter((c) => displayChains?.includes(c.chain))
    .filter((c) => isTerraChain(c.chain))
    .concat(
      chains.filter((c) => isOsmosisChain(c.chain)),
      chains.filter((c) => !isTerraChain(c.chain) && !isOsmosisChain(c.chain))
    )
  return sorted.map((c) => c.chain)
}

export const useTerraChainName = () =>
  useNetworkName() === "mainnet" ? "phoenix-1" : "pisco-1"

export const isNativeToken = (denom: string) =>
  !denom.startsWith("ibc/") &&
  !denom.startsWith("factory/") &&
  !denom.startsWith("gamm/") &&
  !AccAddress.validate(denom)
