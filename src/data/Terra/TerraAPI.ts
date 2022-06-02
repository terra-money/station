import { bech32 } from "bech32"
import { useMemo } from "react"
import { useQuery } from "react-query"
import axios, { AxiosError } from "axios"
import BigNumber from "bignumber.js"
import {
  OracleParams,
  ValAddress,
  ValConsAddress,
  Validator,
  SigningInfo,
} from "@terra-money/terra.js"
import { TerraValidator } from "types/validator"
import { TerraProposalItem } from "types/proposal"
import { useNetworkName } from "data/wallet"
import { useOracleParams } from "data/queries/oracle"
import { queryKey, RefetchOptions } from "../query"
import {
  useValidators,
  useValidator,
  useSigningInfos,
  useSigningInfo,
  useAnnualProvisions,
  useStakingPool,
} from "data/queries/staking"

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

export const useTerraAPIURL = (network?: string) => {
  const networkName = useNetworkName()
  return {
    mainnet: "https://api.terra.dev",
    testnet: "https://bombay-api.terra.dev",
  }[network ?? networkName]
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
  return {
    data: { umis: "0.0001" },
  }
  // const current = useTerraAPIURL()
  // const mainnet = useTerraAPIURL("mainnet")
  // const baseURL = current ?? mainnet
  // const path = "/gas-prices"

  // return useQuery(
  //   [queryKey.TerraAPI, baseURL, path],
  //   async () => {
  //     const { data } = await axios.get<GasPrices>(path, { baseURL })
  //     return data
  //   },
  //   { ...RefetchOptions.INFINITY, enabled: !!baseURL }
  // )
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
  const { data: ap } = useAnnualProvisions()
  const { data: stakingPool } = useStakingPool()
  const estimatedReward =
    ap && stakingPool
      ? ap.div(stakingPool?.bonded_tokens.amount.abs()).toNumber()
      : 0
  return {
    data: [
      {
        datetime: 0,
        value: (type == "annualized"
          ? estimatedReward
          : estimatedReward / 365
        ).toString(),
      } as ChartDataItem,
    ],
  }

  //return useTerraAPI<ChartDataItem[]>(`chart/staking-return/${type}`)
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

export function valConsAddress(val: Validator | undefined): ValConsAddress {
  const valconAddress = val?.consensus_pubkey
    ? bech32.encode(
        "misesvalcons",
        bech32.toWords(val?.consensus_pubkey?.rawAddress())
      )
    : ""
  return valconAddress
}

function uptime_estimated(info: SigningInfo | undefined): number {
  if (!info) {
    return 0
  }
  const { missed_blocks_counter, start_height, index_offset } = info
  if (missed_blocks_counter && index_offset && index_offset > start_height) {
    return 1 - Number(missed_blocks_counter) / (index_offset - start_height)
  } else {
    return 1
  }
}

/* validators */
export const useTerraValidators = () => {
  const { data: validators } = useValidators()
  const { data: infos } = useSigningInfos()

  const { data: ap } = useAnnualProvisions()
  const { data: stakingPool } = useStakingPool()
  const estimatedReward =
    ap && stakingPool
      ? ap.div(stakingPool?.bonded_tokens.amount.abs()).toNumber() / 12
      : 0
  return {
    data: validators?.map<TerraValidator>((val) => {
      const info = infos?.find(({ address }) => address === valConsAddress(val))
      return {
        ...val.toData(),
        voting_power: val.tokens.divToInt(1000000).toString(),
        miss_counter: info?.missed_blocks_counter ?? "0",
        start_height: info?.start_height ?? 0,
        index_offset: info?.index_offset ?? 0,
        rewards_30d: (
          estimatedReward *
          (1 - val.commission.commission_rates.rate.toNumber())
        ).toString(),
        time_weighted_uptime: uptime_estimated(info),
      } as TerraValidator
    }),
  }
  //return useTerraAPI<TerraValidator[]>("validators", undefined, [])
}

export const useTerraValidator = (address: ValAddress) => {
  const { data: validator } = useValidator(address)
  if (validator?.consensus_pubkey) {
  }
  const { data: info } = useSigningInfo(valConsAddress(validator))

  return {
    data: {
      ...validator?.toData(),
      voting_power: validator?.tokens.divToInt(1000000).toString(),
      miss_counter: info?.missed_blocks_counter ?? "0",
      start_height: info?.start_height ?? 0,
      index_offset: info?.index_offset ?? 0,
      rewards_30d: "1",
      time_weighted_uptime: uptime_estimated(info),
    } as TerraValidator,
  }
  //return useTerraAPI<TerraValidator>(`validators/${address}`)
}

export const useTerraProposal = (id: number) => {
  return useTerraAPI<TerraProposalItem[]>(`proposals/${id}`)
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
    const { miss_counter, start_height, index_offset } = validator
    if (index_offset && start_height && index_offset > start_height) {
      slash_window = index_offset - start_height
    }
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
    //if (!oracleParams) return
    return getCalcUptime(oracleParams)
  }, [oracleParams])

  const data = useMemo(() => {
    if (!calc) return
    return calc(validator)
  }, [calc, validator])

  return { data, ...state }
}
