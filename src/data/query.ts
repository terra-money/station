import { useChainID } from "auth/hooks/useNetwork"
import { LAZY_LIMIT, CLASSIC_CHAIN_IDS } from "config/constants"

export const useIsClassic = () => {
  const chainId = useChainID()
  return CLASSIC_CHAIN_IDS.filter((id) => chainId.startsWith(id)).length !== 0
}

/* refetch */
export const RefetchOptions = {
  DEFAULT: /* onMount, onFocus */ {},
  INFINITY: { staleTime: Infinity, retry: false },
}

/* params */
export const Pagination = {
  "pagination.limit": String(LAZY_LIMIT),
}

/* helpers */
export const combineState = (...results: QueryState[]) => ({
  isIdle: results.some((result) => result.isIdle),
  isLoading: results.some((result) => result.isLoading),
  isFetching: results.some((result) => result.isFetching),
  isSuccess: results.every((result) => result.isSuccess),
  error: results.find((result) => result.error)?.error,
})

/* queryKey */
const mirror = <T>(obj: T, parentKey?: string): T =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    const next = value
      ? mirror(value, key)
      : [parentKey, key].filter(Boolean).join(".")

    return { ...acc, [key]: next }
  }, {} as T)

export const queryKey = mirror({
  /* assets */
  TerraAssets: "",
  TerraAPI: "",
  History: "",

  /* lcd */
  auth: { accountInfo: "" },
  bank: { balance: "", balances: "", supply: "" },
  distribution: {
    rewards: "",
    communityPool: "",
    validatorCommission: "",
    withdrawAddress: "",
  },
  gov: {
    votingParams: "",
    depositParams: "",
    tallyParams: "",
    proposals: "",
    proposal: "",
    deposits: "",
    votes: "",
    tally: "",
  },
  ibc: { denomTrace: "" },
  market: { params: "" },
  oracle: { activeDenoms: "", exchangeRates: "", params: "" },
  tendermint: { nodeInfo: "" },
  staking: {
    validators: "",
    validator: "",
    delegations: "",
    delegation: "",
    unbondings: "",
    pool: "",
  },
  treasury: { taxRate: "", taxCap: "" },
  tx: { txInfo: "", create: "" },
  wasm: { contractInfo: "", contractQuery: "" },

  /* external */
  Anchor: { TotalDeposit: "", APY: "", MarketEpochState: "" },
  TNS: "",
})
