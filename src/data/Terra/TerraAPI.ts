import { useMemo } from "react"
import { useQuery } from "react-query"
import axios, { AxiosError } from "axios"
import BigNumber from "bignumber.js"
import { ValAddress, Validator } from "@terra-money/feather.js"
import { TerraValidator } from "types/validator"
import { TerraProposalItem } from "types/proposal"
import { useNetwork, useNetworkName } from "data/wallet"
import { queryKey, RefetchOptions } from "../query"
import { useValidators } from "data/queries/staking"

export enum Aggregate {
  PERIODIC = "periodic",
  CUMULATIVE = "cumulative",
}

export enum AggregateStakingReturn {
  DAILY = "daily",
  ANNUALIZED = "annualized",
}

export enum AggregateWallets {
  TOTAL = "total",
  NEW = "new",
  ACTIVE = "active",
}

export const useTerraAPIURL = () => {
  const network = useNetworkName()
  return network !== "mainnet"
    ? "https://pisco-api.terra.dev"
    : "https://phoenix-api.terra.dev"
}

export const useIsTerraAPIAvailable = () => {
  const url = useTerraAPIURL()
  return !!url
}

export const useTerraAPI = <T>(path: string, params?: object, fallback?: T) => {
  const baseURL = useTerraAPIURL()
  const available = useIsTerraAPIAvailable()
  const shouldFallback = !available && fallback

  return useQuery<T, AxiosError>(
    [queryKey.TerraAPI, baseURL, path, params],
    async () => {
      if (shouldFallback) return fallback
      const { data } = await axios.get(path, { baseURL, params })
      return data
    },
    { ...RefetchOptions.INFINITY, enabled: !!(baseURL || shouldFallback) }
  )
}

/* fee */
export type GasPrices = Record<Denom, Amount>

export const useGasPrices = () => {
  const current = useTerraAPIURL()
  const baseURL = current
  const path = "/gas-prices"

  return useQuery(
    [queryKey.TerraAPI, baseURL, path],
    async () => {
      const { data } = await axios.get<GasPrices>(path, { baseURL })
      return data
    },
    { ...RefetchOptions.INFINITY, enabled: !!baseURL }
  )
}

/* charts */
export enum ChartInterval {
  "1m" = "1m",
  "5m" = "5m",
  "15m" = "15m",
  "30m" = "30m",
  "1h" = "1h",
  "1d" = "1d",
}

export const useLunaPriceChart = (denom: Denom, interval: ChartInterval) => {
  return useTerraAPI<ChartDataItem[]>(`chart/price/${denom}`, { interval })
}

export const useTxVolume = (denom: Denom, type: Aggregate) => {
  return useTerraAPI<ChartDataItem[]>(`chart/tx-volume/${denom}/${type}`)
}

export const useStakingReturn = (type: AggregateStakingReturn) => {
  return useTerraAPI<ChartDataItem[]>(`chart/staking-return/${type}`)
}

export const useTaxRewards = (type: Aggregate) => {
  return useTerraAPI<ChartDataItem[]>(`chart/tax-rewards/${type}`)
}

export const useWallets = (walletsType: AggregateWallets) => {
  return useTerraAPI<ChartDataItem[]>(`chart/wallets/${walletsType}`)
}

export const useSumActiveWallets = () => {
  return useTerraAPI<Record<string, string>>(`chart/wallets/active/sum`)
}

/* validators */
export const useTerraValidators = () => {
  return useTerraAPI<TerraValidator[]>("validators", undefined, [])
}

export const useTerraValidator = (address: ValAddress) => {
  return useTerraAPI<TerraValidator>(`validators/${address}`)
}

export const useTerraProposal = (id: string) => {
  return useTerraAPI<TerraProposalItem[]>(`proposals/${id}`)
}

/* helpers */
export const getCalcVotingPowerRate = (validators: Validator[]) => {
  const total = BigNumber.sum(
    ...validators
      .filter(
        ({ status }) => (status as unknown as string) === "BOND_STATUS_BONDED"
      )
      .map(({ tokens }) => tokens.toString())
  ).toNumber()

  return (address: ValAddress) => {
    const validator = validators.find(
      ({ operator_address }) => operator_address === address
    )

    if (!validator) return
    const { tokens, status } = validator
    return (status as unknown as string) === "BOND_STATUS_BONDED"
      ? Number(tokens ?? 0) / total
      : 0
  }
}

export const calcSelfDelegation = (validator?: TerraValidator) => {
  if (!validator) return
  const { self, tokens } = validator
  return self ? Number(self) / Number(tokens) : undefined
}

export const useVotingPowerRate = (address: ValAddress) => {
  const networks = useNetwork()
  const prefix = ValAddress.getPrefix(address)
  const chainID = Object.values(networks ?? {}).find(
    ({ prefix: p }) => p === prefix
  )?.chainID

  const { data: validators, ...state } = useValidators(chainID ?? "")
  const calcRate = useMemo(() => {
    if (!validators) return
    return getCalcVotingPowerRate(validators)
  }, [validators])

  const data = useMemo(() => {
    if (!calcRate) return
    return calcRate(address)
  }, [address, calcRate])

  return { data, ...state }
}
