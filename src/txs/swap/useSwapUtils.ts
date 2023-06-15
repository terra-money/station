import { useCallback } from "react"
import BigNumber from "bignumber.js"
import { fromPairs, zipObj } from "ramda"
import { Coin, Coins, MsgExecuteContract } from "@terra-money/feather.js"
import { isDenom, isDenomLuna } from "@terra-money/terra-utils"
import { isDenomTerra } from "@terra-money/terra-utils"
import { TERRASWAP_COMMISSION_RATE } from "config/constants"
import { has, toPrice } from "utils/num"
import { toAsset, toAssetInfo, toTokenItem } from "utils/coin"
import { toBase64 } from "utils/data"
import { useAddress } from "data/wallet"
import { useInterchainLCDClient } from "data/queries/lcdClient"
import { useSwap } from "./SwapContext"
import { SwapSpread } from "./SingleSwapContext"

/* Call this hook after wrap component around with a SwapContext.
Then, various helper functions will be generated based on the fetched data. */

export enum SwapMode {
  TERRASWAP = "Terraswap",
  ASTROPORT = "Astroport",
  ROUTESWAP = "Route",
}

export interface SwapAssets {
  offerAsset: Token
  askAsset: Token
}

export interface SwapParams extends SwapAssets, Partial<SwapSpread> {
  amount: Amount
}

/* simulated */
// rate: original ratio
// ratio: simulated ratio
// price: simulated ratio to print considering `decimals`
// belief_price: ratio to 18 decimal points
export interface SimulateResult<T = any> {
  mode: SwapMode
  query: SwapParams
  value: Amount
  ratio: Price
  rate?: Price
  payload: T
}

export type PayloadOnchain = Amount // spread
export type PayloadTerraswap = Amount // fee
export type PayloadRouteswap = string[]

const useSwapUtils = () => {
  const address = useAddress()
  const lcd = useInterchainLCDClient()
  const context = useSwap()
  const { pairs, contracts } = context

  /* helpers */
  // terraswap
  const findPair = useCallback(
    (assets: SwapAssets, dex: Dex) => {
      const { offerAsset, askAsset } = assets
      const pair = Object.entries(pairs ?? {}).find(([, item]) =>
        [offerAsset, askAsset].every(
          (asset) => dex === item.dex && item.assets.includes(asset)
        )
      )

      if (!pair) return

      const [address, item] = pair
      return { address, ...item }
    },
    [pairs]
  )

  const getIsTerraswapAvailable = useCallback(
    (assets: SwapAssets) => !!findPair(assets, "terraswap"),
    [findPair]
  )

  const getIsAstroportAvailable = useCallback(
    (assets: SwapAssets) => !!findPair(assets, "astroport"),
    [findPair]
  )

  const getIsRouteswapAvaialble = useCallback(
    (assets: SwapAssets) => {
      if (!contracts) return false
      if (getIsTerraswapAvailable(assets)) return false

      const r0 = getIsTerraswapAvailable({ ...assets, askAsset: "uusd" })

      const r1 = getIsTerraswapAvailable({ ...assets, offerAsset: "uusd" })

      return r0 && r1
    },
    [contracts, getIsTerraswapAvailable]
  )

  const getAvailableSwapModes = useCallback(
    (assets: Partial<SwapAssets>): SwapMode[] => {
      if (!validateAssets(assets)) return []

      const functions = {
        [SwapMode.TERRASWAP]: getIsTerraswapAvailable,
        [SwapMode.ASTROPORT]: getIsAstroportAvailable,
        [SwapMode.ROUTESWAP]: getIsRouteswapAvaialble,
      }

      return Object.entries(functions ?? {})
        .filter(([, fn]) => fn(assets))
        .map(([key]) => key as SwapMode)
    },
    [getIsTerraswapAvailable, getIsAstroportAvailable, getIsRouteswapAvaialble]
  )

  const getIsSwapAvailable = (assets: Partial<SwapAssets>) =>
    !!getAvailableSwapModes(assets).length

  /* swap mode for multiple swap */
  const getSwapMode = useCallback(
    (assets: SwapAssets) => {
      const { askAsset } = assets
      if (isDenomLuna(askAsset)) {
        return getIsTerraswapAvailable(assets)
          ? SwapMode.TERRASWAP
          : SwapMode.ROUTESWAP
      }
    },
    [getIsTerraswapAvailable]
  )

  /* simulate | execute */
  type SimulateFn<T = any> = (params: SwapParams) => Promise<SimulateResult<T>>

  const getTerraswapParams = useCallback(
    (params: SwapParams, dex: Dex) => {
      const { amount, offerAsset, askAsset, belief_price, max_spread } = params
      const fromNative = isDenom(offerAsset)
      const pair = findPair({ offerAsset, askAsset }, dex)
      const offer_asset = toAsset(offerAsset, amount)

      if (!pair) throw new Error("Pair does not exist")
      const contract = fromNative ? pair.address : offerAsset

      /* simulate */
      const query = { simulation: { offer_asset } }

      /* execute */
      const swap =
        belief_price && max_spread ? { belief_price, max_spread } : {}
      const executeMsg = fromNative
        ? { swap: { ...swap, offer_asset } }
        : { send: { amount, contract: pair.address, msg: toBase64({ swap }) } }
      const coins = fromNative ? new Coins({ [offerAsset]: amount }) : undefined
      const msgs = address
        ? [new MsgExecuteContract(address, contract, executeMsg, coins)]
        : []

      return { pair, simulation: { contract: pair.address, query }, msgs }
    },
    [address, findPair]
  )

  const simulateTerraswap = async (
    params: SwapParams,
    dex: Dex = "terraswap"
  ) => {
    const mode = {
      terraswap: SwapMode.TERRASWAP,
      astroport: SwapMode.ASTROPORT,
    }[dex]

    const query = params

    const { amount } = params
    const { pair, simulation } = getTerraswapParams(params, dex)

    if (pair.type === "stable") {
      const { return_amount: value, commission_amount } =
        await lcd.wasm.contractQuery<{
          return_amount: Amount
          commission_amount: Amount
        }>(pair.address, simulation.query)

      const payload = commission_amount
      const ratio = toPrice(new BigNumber(amount).div(value))
      return { mode, query, value, ratio, payload }
    } else {
      const { assets } = await lcd.wasm.contractQuery<{
        assets: [Asset, Asset]
      }>(simulation.contract, { pool: {} })

      const { pool, rate } = parsePool(params, assets)
      const { return_amount: value, commission_amount } = calcXyk(amount, pool)
      const payload = commission_amount
      const ratio = toPrice(new BigNumber(amount).div(value))
      return { mode, query, value, ratio, rate, payload }
    }
  }

  const getAstroportParams = getTerraswapParams
  const simulateAstroport = (params: SwapParams) =>
    simulateTerraswap(params, "astroport")

  const getRouteswapParams = useCallback(
    (params: SwapParams) => {
      /* helper function */
      const createSwap = ({ offerAsset, askAsset }: SwapAssets) => {
        const offer_asset_info = toAssetInfo(offerAsset)
        const ask_asset_info = toAssetInfo(askAsset)
        const buyLuna = isDenomTerra(offerAsset) && isDenomLuna(askAsset)
        return buyLuna
          ? { terra_swap: { offer_asset_info, ask_asset_info } }
          : { native_swap: { offer_denom: offerAsset, ask_denom: askAsset } }
      }

      const { amount, offerAsset, askAsset, minimum_receive } = params
      const fromNative = isDenom(offerAsset)
      if (!contracts?.routeswap) throw new Error("Routeswap is not available")

      const route = [offerAsset, "uusd", askAsset]
      const operations = [
        createSwap({ offerAsset, askAsset: "uusd" }),
        createSwap({ offerAsset: "uusd", askAsset }),
      ]

      const options = minimum_receive && { minimum_receive }
      const swapOperations = { ...options, offer_amount: amount, operations }

      /* simulation */
      const simulation = { simulate_swap_operations: swapOperations }
      const execute = { execute_swap_operations: swapOperations }

      /* msgs */
      const routeswap = contracts.routeswap
      const contract = fromNative ? routeswap : offerAsset
      const executeMsg = fromNative
        ? execute
        : { send: { contract: routeswap, msg: toBase64(execute), amount } }
      const coins = fromNative ? [new Coin(offerAsset, amount)] : undefined
      const msgs = address
        ? [new MsgExecuteContract(address, contract, executeMsg, coins)]
        : []

      return { route, simulation, msgs }
    },
    [address, contracts?.routeswap]
  )

  const simulateRouteswap: SimulateFn<Token[]> = async (params: SwapParams) => {
    if (!contracts?.routeswap) throw new Error("Routeswap is not available")

    const { simulation, route } = getRouteswapParams(params)
    const { amount: value } = await lcd.wasm.contractQuery<{ amount: string }>(
      contracts.routeswap,
      simulation
    )

    const ratio = toPrice(new BigNumber(params.amount).div(value))

    return {
      mode: SwapMode.ROUTESWAP,
      query: params,
      value,
      ratio,
      payload: route,
    }
  }

  const getSimulateFunction = (mode: SwapMode) => {
    const simulationFunctions = {
      [SwapMode.TERRASWAP]: simulateTerraswap,
      [SwapMode.ASTROPORT]: simulateAstroport,
      [SwapMode.ROUTESWAP]: simulateRouteswap,
    }

    return simulationFunctions[mode]
  }

  const getMsgsFunction = useCallback(
    (mode: SwapMode) => {
      const getMsgs = {
        [SwapMode.TERRASWAP]: (params: SwapParams) =>
          getTerraswapParams(params, "terraswap").msgs,
        [SwapMode.ASTROPORT]: (params: SwapParams) =>
          getAstroportParams(params, "astroport").msgs,
        [SwapMode.ROUTESWAP]: (params: SwapParams) =>
          getRouteswapParams(params).msgs,
      }

      return getMsgs[mode]
    },
    [getTerraswapParams, getAstroportParams, getRouteswapParams]
  )

  const getSimulateQuery = (params: Partial<SwapParams>) => ({
    queryKey: ["simulate.swap", params],
    queryFn: async () => {
      if (!validateParams(params)) throw new Error()
      const modes = getAvailableSwapModes(params)
      const functions = modes.map(getSimulateFunction)
      const queries = functions.map((fn) => fn(params))
      const responses = await Promise.allSettled(queries)
      const results = responses.map((result) => {
        if (result.status === "rejected") throw new Error(result.reason)
        return result.value
      })

      return {
        values: zipObj(modes, results),
        profitable: findProfitable(results),
      }
    },
    enabled: validateParams(params),
  })

  return {
    ...context,
    getIsSwapAvailable,
    getSwapMode,
    getAvailableSwapModes,
    getSimulateFunction,
    getSimulateQuery,
    getMsgsFunction,
  }
}

export default useSwapUtils

/* type guard */
export const validateAssets = (
  assets: Partial<SwapAssets>
): assets is Required<SwapAssets> => {
  const { offerAsset, askAsset } = assets
  return !!offerAsset && !!askAsset && offerAsset !== askAsset
}

export const validateParams = (
  params: Partial<SwapParams>
): params is SwapParams => {
  const { amount, ...assets } = params
  return has(amount) && validateAssets(assets)
}

/* helpers */
const findProfitable = (results: SimulateResult[]) => {
  const index = results.reduce(
    (acc, { value }, index) =>
      new BigNumber(value).gt(results[acc].value) ? index : acc,
    0
  )

  return results[index]
}

/* calc */
const parsePool = (
  { offerAsset, askAsset }: SwapAssets,
  pairPool: [Asset, Asset]
) => {
  const pair = fromPairs(
    pairPool.map(toTokenItem).map(({ amount, token }) => [token, amount])
  )

  const offerPool = pair[offerAsset]
  const askPool = pair[askAsset]
  const pool = [offerPool, askPool] as [string, string]
  const rate = toPrice(new BigNumber(pair[offerAsset]).div(pair[askAsset]))

  return { pool, rate }
}

const calcXyk = (amount: Amount, [offerPool, askPool]: [Amount, Amount]) => {
  const returnAmount = new BigNumber(amount)
    .times(askPool)
    .div(new BigNumber(amount).plus(offerPool))
    .integerValue(BigNumber.ROUND_FLOOR)

  const spreadAmount = new BigNumber(amount)
    .times(askPool)
    .div(offerPool)
    .minus(returnAmount)
    .integerValue(BigNumber.ROUND_FLOOR)

  const commissionAmount = returnAmount
    .times(TERRASWAP_COMMISSION_RATE)
    .integerValue(BigNumber.ROUND_FLOOR)

  return {
    return_amount: returnAmount.minus(commissionAmount).toString(),
    spread_amount: spreadAmount.toString(),
    commission_amount: commissionAmount.toString(),
  }
}
