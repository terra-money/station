import { useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { useQuery } from "react-query"
import { useForm } from "react-hook-form"
import update from "immutability-helper"
import BigNumber from "bignumber.js"
import { AccAddress, Coin, Coins } from "@terra-money/feather.js"
import { MsgExecuteContract } from "@terra-money/feather.js"
import { isDenomTerra } from "@terra-money/terra-utils"
import { toAmount } from "@terra-money/terra-utils"

/* helpers */
import { has } from "utils/num"
import { queryKey } from "data/query"
import { useAddress } from "data/wallet"
import { queryTFMRoute, queryTFMSwap, TFM_ROUTER } from "data/external/tfm"

/* components */
import { Form, FormArrow, FormError, FormWarning } from "components/form"
import { Checkbox } from "components/form"
import { Read } from "components/token"

/* tx modules */
import { getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Tx from "../Tx"

/* swap modules */
import AssetFormItem from "./components/AssetFormItem"
import { AssetInput, AssetReadOnly } from "./components/AssetFormItem"
import SelectToken from "./components/SelectToken"
import SlippageControl from "./components/SlippageControl"
import TFMExpectedPrice from "./TFMExpectedPrice"
import { SwapAssets, validateAssets } from "./useSwapUtils"
import { validateParams } from "./useSwapUtils"
import { calcMinimumReceive, SlippageParams } from "./SingleSwapContext"
import { useTFMSwap, validateTFMSlippageParams } from "./TFMSwapContext"
import { useCustomTokensCW20 } from "data/settings/CustomTokens"
import { useNativeDenoms } from "data/token"

interface TFMSwapParams extends SwapAssets {
  amount: string
  slippage?: string
}

interface TxValues extends Partial<SlippageParams> {}

const TFMSwapForm = ({ chainID }: { chainID: string }) => {
  const { t } = useTranslation()
  const address = useAddress()
  const { state } = useLocation()

  // token whitelists
  const cw20 = useCustomTokensCW20()
  const readNativeDenom = useNativeDenoms()

  /* swap context */
  const { options, findTokenItem, findDecimals } = useTFMSwap()

  const initialOfferAsset = (state as Token) ?? "uluna"

  /* options */
  const [showAll, setShowAll] = useState(false)

  const getOptions = (key: "offerAsset" | "askAsset") => {
    const { coins, tokens } = options

    const getOptionList = (list: TokenItemWithBalance[]) =>
      list.map((item) => {
        const { token: value, balance } = item
        const hidden = key === "offerAsset" && !showAll && !has(balance)
        return { ...item, value, hidden }
      })

    return [
      { title: t("Coins"), children: getOptionList(coins) },
      { title: t("Tokens"), children: getOptionList(tokens) },
    ]
  }

  /* form */
  const form = useForm<TxValues>({
    mode: "onChange",
    defaultValues: { offerAsset: initialOfferAsset, slippageInput: 1 },
  })

  const { register, trigger, watch, setValue, handleSubmit, formState } = form
  const { errors } = formState
  const values = watch()
  const { offerAsset, askAsset, input, slippageInput } = values

  const assets = useMemo(
    () => ({ offerAsset, askAsset }),
    [offerAsset, askAsset]
  )

  const slippageParams = useMemo(
    () => ({ offerAsset, askAsset, input, slippageInput }),
    [offerAsset, askAsset, input, slippageInput]
  )

  const offerTokenItem = offerAsset ? findTokenItem(offerAsset) : undefined
  const offerDecimals = offerAsset ? findDecimals(offerAsset) : undefined
  const askDecimals = askAsset ? findDecimals(askAsset) : undefined

  const amount = toAmount(input, { decimals: offerDecimals })

  const swapAssets = () => {
    setValue("offerAsset", askAsset)
    setValue("askAsset", offerAsset)
    setValue("input", undefined)
    trigger("input")
  }

  /* simulate | execute */
  const slippage = new BigNumber(slippageInput!).div(100).toString()
  const params = { ...assets, amount, slippage }

  /* simulate */
  const { data: simulationResults, isFetching } = useQuery(
    ["TFM.simulate.swap", params],
    async () => {
      if (!validateParams(params)) throw new Error()
      const route = await queryTFMRoute(toTFMParams(params))
      const swap = await queryTFMSwap(toTFMParams(params))
      return [route, swap] as const
    },
    { enabled: validateParams(params) }
  )

  const simulatedValue = useMemo(() => {
    if (!(simulationResults && askDecimals)) return
    const [{ return_amount }] = simulationResults
    return toAmount(return_amount, { decimals: askDecimals })
  }, [askDecimals, simulationResults])

  /* Select asset */
  const onSelectAsset = (key: "offerAsset" | "askAsset") => {
    return async (value: Token) => {
      const assets = {
        offerAsset: { offerAsset: value, askAsset },
        askAsset: { offerAsset, askAsset: value },
      }[key]

      // empty opposite asset if select the same asset
      if (assets.offerAsset === assets.askAsset) {
        setValue(key === "offerAsset" ? "askAsset" : "offerAsset", undefined)
      }

      // focus on input if select offer asset
      if (key === "offerAsset") {
        form.resetField("input")
        form.setFocus("input")
      }

      setValue(key, value)
    }
  }

  /* tx */
  const balance = offerTokenItem?.balance
  const createTx = useCallback(() => {
    if (!address) return
    if (!offerAsset) return
    if (!simulationResults) return

    const [, swap] = simulationResults

    if (!("value" in swap)) return

    const { value } = swap
    const contract = AccAddress.validate(value.contract)
      ? value.contract
      : TFM_ROUTER

    const execute_msg = AccAddress.validate(offerAsset)
      ? update(value.execute_msg, { send: { contract: { $set: TFM_ROUTER } } })
      : value.execute_msg

    const coins = new Coins(value.coins.map(Coin.fromData))

    return {
      msgs: [new MsgExecuteContract(address, contract, execute_msg, coins)],
      chainID,
    }
  }, [address, offerAsset, simulationResults, chainID])

  /* fee */
  const { data: estimationTxValues } = useQuery(
    ["estimationTxValues", { assets }],
    async () => {
      if (!validateAssets(assets)) return
      const { offerAsset, askAsset } = assets
      // estimate fee only after ratio simulated
      return { offerAsset, askAsset, input, slippageInput: 1 }
    }
  )

  const token = offerAsset
  const decimals = offerDecimals
  const tx = {
    token,
    decimals,
    amount,
    balance,
    estimationTxValues,
    createTx,
    queryKeys: [
      queryKey.bank.balances,
      queryKey.bank.balance,
      queryKey.wasm.contractQuery,
    ],
    onSuccess: () => {
      if (askAsset && AccAddress.validate(askAsset)) {
        const data = readNativeDenom(askAsset)
        cw20.add({
          ...data,
          token: askAsset,
          name: data.name ?? data.symbol,
        })
      }
    },
    chain: chainID,
  }

  const disabled = isFetching ? t("Simulating...") : false

  /* render: expected price */
  const renderExpected = () => {
    if (!(simulatedValue && simulationResults)) return null
    if (!validateTFMSlippageParams(slippageParams)) return null

    const [{ return_amount, input_amount, price_impact }] = simulationResults
    const expected = {
      minimum_receive: calcMinimumReceive(simulatedValue, slippage),
      price: new BigNumber(input_amount).div(return_amount).toNumber(),
      price_impact,
    }

    const props = { ...slippageParams, ...expected }
    return <TFMExpectedPrice {...props} />
  }

  const slippageDisabled = [offerAsset, askAsset].every(isDenomTerra)

  const isFailed = useMemo(() => {
    if (!simulationResults) return false
    const [, swap] = simulationResults
    if ("success" in swap && !swap.success) return true
    return false
  }, [simulationResults])

  return (
    <Tx {...tx} disabled={disabled}>
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <FormWarning>
            {t("Leave coins to pay fees for subsequent transactions")}
          </FormWarning>
          <AssetFormItem
            label={t("From")}
            extra={max.render(async (value) => {
              // Do not use automatic max here
              // Confusion arises as the amount changes and simulates again
              setValue("input", toInput(value, offerDecimals))
              await trigger("input")
            })}
            error={errors.input?.message}
          >
            <SelectToken
              value={offerAsset}
              onChange={onSelectAsset("offerAsset")}
              options={getOptions("offerAsset")}
              checkbox={
                <Checkbox
                  checked={showAll}
                  onChange={() => setShowAll(!showAll)}
                >
                  {t("Show all")}
                </Checkbox>
              }
              addonAfter={
                <AssetInput
                  {...register("input", {
                    valueAsNumber: true,
                    validate: validate.input(
                      toInput(max.amount, offerDecimals),
                      offerDecimals
                    ),
                  })}
                  inputMode="decimal"
                  placeholder={getPlaceholder(offerDecimals)}
                  onFocus={max.reset}
                  autoFocus
                />
              }
              showName
            />
          </AssetFormItem>

          <FormArrow onClick={swapAssets} />

          <AssetFormItem label={t("To")}>
            <SelectToken
              value={askAsset}
              onChange={onSelectAsset("askAsset")}
              options={getOptions("askAsset")}
              addonAfter={
                <AssetReadOnly>
                  {simulatedValue ? (
                    <Read
                      amount={simulatedValue}
                      decimals={askDecimals}
                      approx
                    />
                  ) : (
                    <p className="muted">
                      {isFetching ? t("Simulating...") : "0"}
                    </p>
                  )}
                </AssetReadOnly>
              }
              showName
            />
          </AssetFormItem>

          {!slippageDisabled && (
            <SlippageControl
              {...register("slippageInput", {
                valueAsNumber: true,
                validate: validate.input(50, 2, "Slippage tolerance"),
              })}
              input={slippageInput} // to warn
              inputMode="decimal"
              placeholder={getPlaceholder(2)}
              error={errors.slippageInput?.message}
            />
          )}

          {renderExpected()}
          {fee.render()}

          {validateAssets(assets) && isFailed && (
            <FormError>{t("Pair does not exist")}</FormError>
          )}

          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default TFMSwapForm

/* helpers */
const toTFMParams = (params: TFMSwapParams) => {
  const { offerAsset: token0, askAsset: token1, amount } = params
  return { ...params, token0, token1, amount, use_split: true }
}
