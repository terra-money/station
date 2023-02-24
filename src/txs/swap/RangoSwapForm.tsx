import { Coin, Coins, MsgExecuteContract } from "@terra-money/feather.js"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { Form } from "components/form"
import { RangoMsg, useRangoQuote, useRangoSwap } from "data/external/rango"
import { useTokenBalance } from "data/queries/bank"
import { fromBase64 } from "js-base64"
import { CosmosTransaction, QuoteRequest } from "rango-sdk-basic"
import { useCallback, useMemo } from "react"
import Tx from "txs/Tx"
import { microfy } from "utils/microfy"
import { useCurrentChain } from "./CurrentChainProvider"
import { useCurrentChainTokens } from "./CurrentChainTokensProvider"
import { useSwapForm } from "./hooks/useSwapForm"
import { SwapFormFields } from "./SwapFormFields"

export const RangoSwapForm = () => {
  const form = useSwapForm()
  const {
    handleSubmit,
    watch,
    formState: { isValid },
  } = form

  const chainId = useCurrentChain()
  const interchainAddresses = useInterchainAddresses()

  const { tokensRecord } = useCurrentChainTokens()

  const values = watch()
  const { offerAsset, askAsset, amount, slippage } = values

  const rangoQuoteParams = useMemo(() => {
    if (!isValid) return

    const from = tokensRecord[offerAsset]
    const to = tokensRecord[askAsset]
    const params: QuoteRequest = {
      from: {
        blockchain: chainId,
        address: from.address,
        symbol: from.symbol,
      },
      to: {
        blockchain: chainId,
        address: to.address,
        symbol: to.symbol,
      },
      amount: microfy(amount, from.decimals),
    }

    return params
  }, [amount, askAsset, chainId, isValid, offerAsset, tokensRecord])

  const { data: quote, isFetching: isFetchingQuote } =
    useRangoQuote(rangoQuoteParams)

  const { data: swap } = useRangoSwap(
    useMemo(() => {
      if (!rangoQuoteParams) return

      if (!interchainAddresses) return

      const address = interchainAddresses[chainId]

      return {
        ...rangoQuoteParams,
        fromAddress: address,
        toAddress: address,
        referrerAddress: null,
        referrerFee: null,
        disableEstimate: false,
        slippage: slippage.toString(),
      }
    }, [chainId, interchainAddresses, rangoQuoteParams, slippage])
  )

  const tx = swap?.tx

  const createTx = useCallback(() => {
    if (!tx) return

    const { data } = tx as CosmosTransaction
    const msgs = data.msgs as RangoMsg[]

    return {
      chainID: chainId,
      msgs: msgs.map(({ __type, value }) => {
        if (__type === "MsgExecuteContract") {
          const { sender, contract, msg, funds } = value
          return new MsgExecuteContract(
            sender,
            contract,
            JSON.parse(fromBase64(msg)),
            new Coins(funds.map((fund) => new Coin(fund.denom, fund.amount)))
          )
        }

        throw new Error(`Unsupported msg type ${__type}`)
      }),
    }
  }, [chainId, tx])

  const { data: balance } = useTokenBalance(
    offerAsset ? { denom: offerAsset, chain: chainId } : undefined
  )

  return (
    <Tx
      token={offerAsset}
      decimals={offerAsset ? tokensRecord[offerAsset].decimals : undefined}
      amount={amount?.toString()}
      chain={chainId}
      disabled={swap?.error || undefined}
      createTx={createTx}
      estimationTxValues={values}
      balance={balance}
      // TODO: queryKeys (refetch balance)
    >
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <SwapFormFields
            form={form}
            outputAmount={quote?.route?.outputAmount}
            isFetchingOutputAmount={isFetchingQuote}
            maxAmount={max.amount}
            renderMax={max.render}
            resetMax={max.reset}
          />

          {fee.render()}

          {submit.button}
        </Form>
      )}
    </Tx>
  )
}
