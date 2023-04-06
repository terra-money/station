import BigNumber from "bignumber.js"
import { readAmount, toAmount } from "@terra-money/terra-utils"
import { Coin, Coins } from "@terra-money/feather.js"
import { has } from "utils/num"
import { FindDecimals } from "./IBCHelperContext"
import { getShouldTax } from "data/queries/treasury"
import { calcMinimumTaxAmount } from "./Tx"
import { useNetworkName } from "data/wallet"
import {
  createActionRuleSet,
  createLogMatcherForActions,
  getTxCanonicalMsgs,
} from "@terra-money/log-finder-ruleset"

export const getPlaceholder = (decimals = 6) => "0.".padEnd(decimals + 2, "0")

export const toInput = (amount: BigNumber.Value, decimals = 6) =>
  new BigNumber(readAmount(amount, { decimals })).toNumber()

/* field array (coins) */
export interface CoinInput {
  input?: number
  denom: CoinDenom
  taxRequired?: boolean
}

export const getCoins = (coins: CoinInput[], findDecimals?: FindDecimals) => {
  return new Coins(
    coins
      .map(({ input, denom }) => {
        const decimals = findDecimals?.(denom)
        return { amount: toAmount(input, { decimals }), denom }
      })
      .filter(({ amount }) => has(amount))
      .map(({ amount, denom }) => new Coin(denom, amount))
  )
}

export interface TaxParams {
  taxRate?: string
  taxCap?: string
}

export const calcTaxes = (
  coins: CoinInput[],
  { taxRate = "0", taxCap = "0" }: TaxParams,
  isClassic: boolean
) => {
  return new Coins(
    coins
      .filter(({ input, denom, taxRequired }) => {
        const amount = toAmount(input)
        return getShouldTax(denom, isClassic) && has(amount) && taxRequired
      })
      .map(({ input, denom, taxRequired }) => {
        const amount = toAmount(input)
        const tax = calcMinimumTaxAmount(amount, {
          rate: taxRequired ? taxRate : "0",
          cap: taxCap,
        })

        if (!tax) throw new Error()
        return new Coin(denom, tax)
      })
  )
}

export const useGetTxMessage = () => {
  const networkName = useNetworkName()
  const ruleset = createActionRuleSet(networkName)
  const logMatcher = createLogMatcherForActions(ruleset)

  return (txInfo: any) => {
    const txMsgs = txInfo.tx.body.messages[0]
    // if (txInfo.txhash.startsWith("7F2DD4")) {
    //   console.log('MsgSend', txInfo.tx)
    // }
    // if (txInfo.txhash.startsWith("48C514C165")) {
    //   console.log('Transfer', txInfo.tx)
    // }
    if (txInfo.txhash.startsWith("48C514")) {
      console.log("Transfer", txMsgs.receiver)
    }
    const msgType = txMsgs["@type"]
    switch (msgType) {
      case "/cosmos.tx.v1beta1.MsgSend":
      case "/ibc.applications.transfer.v1.MsgTransfer":
        const { denom, amount } = txMsgs.token
        return [
          {
            msgType,
            canonicalMsg: [
              `Sent ${amount} ${denom} to ${
                txMsgs.to_address || txMsgs.receiver
              }`,
            ],
          },
        ]
      default:
        const matchedMsg = getTxCanonicalMsgs(txInfo, logMatcher)
        return matchedMsg
          ? matchedMsg
              .map((matchedLog) =>
                matchedLog.map(({ transformed }) => transformed)
              )
              .flat(2)
          : []
    }
  }
}
