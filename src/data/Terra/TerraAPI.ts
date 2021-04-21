import { useMemo } from "react"
import { useQuery } from "react-query"
import axios, { AxiosError } from "axios"
import BigNumber from "bignumber.js"
import { OracleParams, ValAddress } from "@terra-money/terra.js"
import { TerraValidator } from "types/validator"
import { useNetworkName } from "data/wallet"
import { useOracleParams } from "data/queries/oracle"
import { queryKey, RefetchOptions } from "../query"

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
  ACTIVE = "active",
}

export const useTerraAPIURL = () => {
  const networkName = useNetworkName()
  return {
    mainnet: "https://api.terra.dev",
    testnet: "https://bombay-api.terra.dev",
  }[networkName]
}

export const useTerraAPI = <T>(path: string) => {
  const baseURL = useTerraAPIURL()

  return useQuery<T, AxiosError>(
    [queryKey.TerraAPI, baseURL, path],
    async () => {
      const { data } = await axios.get(path, { baseURL })
      return data
    },
    { ...RefetchOptions.INFINITY, enabled: !!baseURL }
  )
}

/* fee */
export type GasPrices = Record<Denom, Amount>

export const useGasPrices = () => {
  return useTerraAPI<GasPrices>("/gas-prices")
}

/* charts */
export const useTxVolume = (denom: Denom, type: Aggregate) => {
  return useTerraAPI<ChartDataItem[]>(`chart/tx-volume/${denom}/${type}`)
}

export const useStakingReturn = (type: AggregateStakingReturn) => {
  return useTerraAPI<ChartDataItem[]>(`chart/staking-return/${type}`)
}

export const useTaxRewards = (type: Aggregate) => {
  return useTerraAPI<ChartDataItem[]>(`chart/tax-rewards/${type}`)
}

export const useWallets = (walletsType: AggregateWallets, type: Aggregate) => {
  return useTerraAPI<ChartDataItem[]>(`chart/wallets/${walletsType}/${type}`)
}

/* validators */
export const useTerraValidators = () => {
  return useTerraAPI<TerraValidator[]>("validators")
}

export const useTerraValidator = (address: ValAddress) => {
  return useTerraAPI<TerraValidator>(`validators/${address}`)
}

/* helpers */
export const getCalcVotingPowerRate = (TerraValidators: TerraValidator[]) => {
  const total = BigNumber.sum(
    ...TerraValidators.map(({ voting_power = 0 }) => voting_power)
  ).toNumber()

  return (address: ValAddress) => {
    const validator = TerraValidators.find(
      ({ operator_address }) => operator_address === address
    )

    if (!validator) return
    const { voting_power } = validator
    return voting_power ? Number(validator.voting_power) / total : undefined
  }
}

export const calcSelfDelegation = (validator?: TerraValidator) => {
  if (!validator) return
  const { self, tokens } = validator
  return self ? Number(self) / Number(tokens) : undefined
}

export const getCalcUptime = ({ slash_window }: OracleParams) => {
  return (validator?: TerraValidator) => {
    if (!validator) return
    const { miss_counter } = validator
    return miss_counter ? 1 - Number(miss_counter) / slash_window : undefined
  }
}

export const useVotingPowerRate = (address: ValAddress) => {
  const { data: TerraValidators, ...state } = useTerraValidators()
  const calcRate = useMemo(() => {
    if (!TerraValidators) return
    return getCalcVotingPowerRate(TerraValidators)
  }, [TerraValidators])

  const data = useMemo(() => {
    if (!calcRate) return
    return calcRate(address)
  }, [address, calcRate])

  return { data, ...state }
}

export const useUptime = (validator: TerraValidator) => {
  const { data: oracleParams, ...state } = useOracleParams()

  const calc = useMemo(() => {
    if (!oracleParams) return
    return getCalcUptime(oracleParams)
  }, [oracleParams])

  const data = useMemo(() => {
    if (!calc) return
    return calc(validator)
  }, [calc, validator])

  return { data, ...state }
}
