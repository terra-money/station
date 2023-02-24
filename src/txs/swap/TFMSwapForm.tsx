import { Form } from "components/form"
import {
  TFMRouteParams,
  useTFMRoute,
  useTFMSwap,
} from "data/external/multichainTfm"
import { useTokenBalance } from "data/queries/bank"
import { useCallback, useMemo } from "react"
import Tx from "txs/Tx"
import { microfy } from "utils/microfy"
import { useCurrentChain } from "./CurrentChainProvider"
import { useCurrentChainTokens } from "./CurrentChainTokensProvider"
import { useSwapForm } from "./hooks/useSwapForm"
import { SwapFormFields } from "./SwapFormFields"

export const TFMSwapForm = () => {
  const form = useSwapForm()
  const {
    handleSubmit,
    watch,
    formState: { isValid },
  } = form

  const chainId = useCurrentChain()

  const { tokensRecord } = useCurrentChainTokens()

  const values = watch()
  const { offerAsset, askAsset, amount, slippage } = values

  const tfmRouteParams = useMemo(() => {
    if (!isValid) return

    const params: TFMRouteParams = {
      token0: offerAsset,
      token1: askAsset,
      chain0: chainId,
      chain1: chainId,
      amount: microfy(amount, tokensRecord[offerAsset].decimals),
    }

    return params
  }, [amount, askAsset, chainId, isValid, offerAsset, tokensRecord])

  const { data: route, isFetching: isFetchingRoute } =
    useTFMRoute(tfmRouteParams)

  const { data: swap } = useTFMSwap(
    useMemo(() => {
      if (!tfmRouteParams) return

      return {
        ...tfmRouteParams,
        slippage: slippage.toString(),
      }
    }, [slippage, tfmRouteParams])
  )

  console.log(swap)

  const { data: balance } = useTokenBalance(
    offerAsset ? { denom: offerAsset, chain: chainId } : undefined
  )

  const createTx = useCallback(() => {
    return undefined
  }, [])

  return (
    <Tx
      token={offerAsset}
      decimals={offerAsset ? tokensRecord[offerAsset].decimals : undefined}
      amount={amount?.toString()}
      chain={chainId}
      // disabled={swap?.error || undefined}
      createTx={createTx}
      estimationTxValues={values}
      balance={balance}
      // TODO: queryKeys (refetch balance)
    >
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <SwapFormFields
            form={form}
            outputAmount={route?.return_amount?.toString()}
            isFetchingOutputAmount={isFetchingRoute}
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
