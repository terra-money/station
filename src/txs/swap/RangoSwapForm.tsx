import { Coin, Coins, MsgExecuteContract } from "@terra-money/feather.js"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { Form } from "components/form"
import { RangoMsg, useRangoSwap } from "data/external/rango"
import { fromBase64 } from "js-base64"
import { CosmosTransaction } from "rango-sdk-basic"
import { useCallback, useMemo } from "react"
import Tx from "txs/Tx"
import { microfy } from "utils/microfy"
import { useCurrentChain } from "./CurrentChainProvider"
import { useCurrentChainTokens } from "./CurrentChainTokensContext"
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

  const { data: swap } = useRangoSwap(
    useMemo(() => {
      if (!isValid) return

      if (!interchainAddresses) return

      const address = interchainAddresses[chainId]

      const from = tokensRecord[offerAsset]
      const to = tokensRecord[askAsset]
      return {
        from,
        to,
        amount: microfy(amount, from.decimals),
        fromAddress: address,
        toAddress: address,
        referrerAddress: null,
        referrerFee: null,
        disableEstimate: false,
        // TODO; enable estimate
        // disableEstimate: true,
        slippage: slippage.toString(),
      }
    }, [
      amount,
      askAsset,
      chainId,
      interchainAddresses,
      isValid,
      offerAsset,
      slippage,
      tokensRecord,
    ])
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

  return (
    <Tx
      token={offerAsset}
      decimals={offerAsset ? tokensRecord[offerAsset].decimals : undefined}
      amount={amount?.toString()}
      chain={chainId}
      disabled={swap?.error || undefined}
      createTx={createTx}
      estimationTxValues={values}
      // TODO: balance
      // TODO: queryKeys (refetch balance)
    >
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <SwapFormFields form={form} />
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}
