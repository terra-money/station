import { PropsWithChildren, useMemo } from "react"
import { flatten, uniq, zipObj } from "ramda"
import BigNumber from "bignumber.js"
import { isDenomIBC, toAmount } from "@terra-money/terra-utils"
import { AccAddress } from "@terra-money/feather.js"
import { getAmount, sortDenoms } from "utils/coin"
import { toPrice } from "utils/num"
import createContext from "utils/createContext"
import { useCurrency } from "data/settings/Currency"
import { combineState } from "data/query"
import { useBankBalance } from "data/queries/bank"
import { useTokenBalances } from "data/queries/wasm"
import { readIBCDenom, useNativeDenoms } from "data/token"
import { useIBCWhitelist } from "data/Terra/TerraAssets"
import { useCW20Whitelist } from "data/Terra/TerraAssets"
import { useCustomTokensCW20 } from "data/settings/CustomTokens"
import { Card } from "components/layout"
import { useSwap } from "./SwapContext"
import { SwapAssets, validateAssets } from "./useSwapUtils"

export interface SlippageParams extends SwapAssets {
  input: number
  slippageInput: number
  ratio: Price
}

export interface SwapSpread {
  max_spread: string
  minimum_receive: Amount
  belief_price: string
  price: number
}

interface SingleSwap {
  options: {
    coins: TokenItemWithBalance[]
    tokens: TokenItemWithBalance[]
  }
  findTokenItem: (token: Token) => TokenItemWithBalance
  findDecimals: (token: Token) => number
  calcExpected: (params: SlippageParams) => SwapSpread
}

export const [useSingleSwap, SingleSwapProvider] =
  createContext<SingleSwap>("useSingleSwap")

const SingleSwapContext = ({ children }: PropsWithChildren<{}>) => {
  const currency = useCurrency()
  const bankBalance = useBankBalance()
  const { activeDenoms, pairs } = useSwap()
  const { list } = useCustomTokensCW20()
  const readNativeDenom = useNativeDenoms()
  const customTokens = list.map(({ token }) => token)

  /* contracts */
  const { data: ibcWhitelist, ...ibcWhitelistState } = useIBCWhitelist()
  const { data: cw20Whitelist, ...cw20WhitelistState } = useCW20Whitelist()

  // Why?
  // To search tokens with symbol (ibc, cw20)
  // To filter tokens with balance (cw20)
  const terraswapAvailableList = useMemo(() => {
    if (!(ibcWhitelist && cw20Whitelist)) return

    const terraswapAvailableList = uniq(
      flatten(Object.values(pairs ?? {}).map(({ assets }) => assets))
    )

    const ibc = terraswapAvailableList
      .filter(isDenomIBC)
      .filter((denom) => ibcWhitelist[denom.replace("ibc/", "")])

    const cw20 = terraswapAvailableList
      .filter((addr) => AccAddress.validate(addr))
      .filter((token) => cw20Whitelist[token])

    return { ibc, cw20 }
  }, [cw20Whitelist, ibcWhitelist, pairs])

  // Fetch cw20 balances: only listed and added by the user
  const cw20TokensBalanceRequired = useMemo(() => {
    if (!terraswapAvailableList) return []
    return customTokens.filter((token) =>
      terraswapAvailableList.cw20.includes(token)
    )
  }, [customTokens, terraswapAvailableList])

  const cw20TokensBalancesState = useTokenBalances(cw20TokensBalanceRequired)
  const cw20TokensBalances = useMemo(() => {
    if (cw20TokensBalancesState.some(({ isSuccess }) => !isSuccess)) return

    return zipObj(
      cw20TokensBalanceRequired,
      cw20TokensBalancesState.map(({ data }) => {
        if (!data) throw new Error()
        return data
      })
    )
  }, [cw20TokensBalanceRequired, cw20TokensBalancesState])

  const context = useMemo(() => {
    if (!(terraswapAvailableList && ibcWhitelist && cw20Whitelist)) return
    if (!cw20TokensBalances) return

    const coins = sortDenoms(activeDenoms, currency.id).map((denom) => {
      const balance = getAmount(bankBalance, denom)
      return { ...readNativeDenom(denom), balance }
    })

    const ibc = terraswapAvailableList.ibc.map((denom) => {
      const item = ibcWhitelist[denom.replace("ibc/", "")]
      const balance = getAmount(bankBalance, denom)
      return { ...readIBCDenom(item), balance }
    })

    const cw20 = terraswapAvailableList.cw20.map((token) => {
      const balance = cw20TokensBalances[token] ?? "0"
      return { ...cw20Whitelist[token], balance }
    })

    const options = { coins, tokens: [...ibc, ...cw20] }

    const findTokenItem = (token: Token) => {
      const key =
        AccAddress.validate(token) || isDenomIBC(token) ? "tokens" : "coins"

      const option = options[key].find((item) => item.token === token)
      if (!option) throw new Error()
      return option
    }

    const findDecimals = (token: Token) => findTokenItem(token).decimals

    const calcExpected = (params: SlippageParams) => {
      const { offerAsset, askAsset, input, slippageInput, ratio } = params
      const offerDecimals = findDecimals(offerAsset)
      const askDecimals = findDecimals(askAsset)

      /* terraswap */
      const belief_price = new BigNumber(ratio)
        .dp(18, BigNumber.ROUND_DOWN)
        .toString()

      /* routeswap | on-chain */
      const max_spread = new BigNumber(slippageInput).div(100).toString()
      const amount = toAmount(input, { decimals: offerDecimals })
      const value = Number(amount) / ratio
      const minimum_receive = calcMinimumReceive(value, max_spread)

      /* expected price */
      const decimals = askDecimals - offerDecimals
      const price = toPrice(
        new BigNumber(ratio).times(new BigNumber(10).pow(decimals))
      )

      return { max_spread, belief_price, minimum_receive, price }
    }

    return { options, findTokenItem, findDecimals, calcExpected }
  }, [
    currency,
    bankBalance,
    activeDenoms,
    ibcWhitelist,
    cw20Whitelist,
    terraswapAvailableList,
    cw20TokensBalances,
    readNativeDenom,
  ])

  const state = combineState(
    ibcWhitelistState,
    cw20WhitelistState,
    ...cw20TokensBalancesState
  )

  const render = () => {
    if (!context) return null
    return <SingleSwapProvider value={context}>{children}</SingleSwapProvider>
  }

  return <Card {...state}>{render()}</Card>
}

export default SingleSwapContext

/* type */
export const validateSlippageParams = (
  params: Partial<SlippageParams>
): params is SlippageParams => {
  const { input, slippageInput, ratio, ...assets } = params
  return !!(validateAssets(assets) && input && slippageInput && ratio)
}

/* minimum received */
export const calcMinimumReceive = (
  simulatedValue: Value,
  max_spread: string
) => {
  const minRatio = new BigNumber(1).minus(max_spread)
  const value = new BigNumber(simulatedValue).times(minRatio)
  return value.integerValue(BigNumber.ROUND_FLOOR).toString()
}
