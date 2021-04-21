import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { useQuery } from "react-query"
import { useForm } from "react-hook-form"
import BigNumber from "bignumber.js"
import { AccAddress } from "@terra-money/terra.js"
import { isDenomTerra } from "@terra.kitchen/utils"
import { toAmount } from "@terra.kitchen/utils"

/* helpers */
import { has } from "utils/num"
import { getAmount, sortCoins } from "utils/coin"
import { queryKey } from "data/query"
import { useAddress } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { useCustomTokensCW20 } from "data/settings/CustomTokens"

/* components */
import { Form, FormArrow, FormError } from "components/form"
import { Checkbox, RadioButton } from "components/form"
import { Read } from "components/token"

/* tx modules */
import { getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Tx, { getInitialGasDenom } from "../Tx"

/* swap modules */
import AssetFormItem from "./components/AssetFormItem"
import { AssetInput, AssetReadOnly } from "./components/AssetFormItem"
import SelectToken from "./components/SelectToken"
import SlippageControl from "./components/SlippageControl"
import ExpectedPrice from "./components/ExpectedPrice"
import useSwapUtils, { validateAssets } from "./useSwapUtils"
import { SwapMode, validateParams } from "./useSwapUtils"
import { SlippageParams } from "./SingleSwapContext"
import { validateSlippageParams, useSingleSwap } from "./SingleSwapContext"
import styles from "./SwapForm.module.scss"

interface TxValues extends Partial<SlippageParams> {
  mode?: SwapMode
}

const SwapForm = () => {
  const { t } = useTranslation()
  const address = useAddress()
  const { state } = useLocation()
  const bankBalance = useBankBalance()
  const { add } = useCustomTokensCW20()

  /* swap context */
  const utils = useSwapUtils()
  const { getIsSwapAvailable, getAvailableSwapModes } = utils
  const { getMsgsFunction, getSimulateFunction, getSimulateQuery } = utils
  const { options, findTokenItem, findDecimals, calcExpected } = useSingleSwap()

  const initialOfferAsset =
    (state as Token) ??
    (getAmount(bankBalance, "uusd") ? "uusd" : sortCoins(bankBalance)[0].denom)
  const initialGasDenom = getInitialGasDenom(bankBalance, initialOfferAsset)

  /* options */
  const [showAll, setShowAll] = useState(false)

  const getOptions = (key: "offerAsset" | "askAsset") => {
    const { coins, tokens } = options

    const getOptionList = (list: TokenItemWithBalance[]) =>
      list.map((item) => {
        const { token: value, balance } = item

        const muted = {
          offerAsset:
            !!askAsset && !getIsSwapAvailable({ offerAsset: value, askAsset }),
          askAsset:
            !!offerAsset &&
            !getIsSwapAvailable({ offerAsset, askAsset: value }),
        }[key]

        const hidden = key === "offerAsset" && !showAll && !has(balance)
        return { ...item, value, muted, hidden }
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
  const { mode, offerAsset, askAsset, input, slippageInput, ratio } = values

  useEffect(() => {
    // validate input on change mode
    if (mode) trigger("input")
  }, [mode, trigger])

  const assets = useMemo(
    () => ({ offerAsset, askAsset }),
    [offerAsset, askAsset]
  )

  const slippageParams = useMemo(
    () => ({ offerAsset, askAsset, input, slippageInput, ratio }),
    [askAsset, input, offerAsset, ratio, slippageInput]
  )

  const offerTokenItem = offerAsset ? findTokenItem(offerAsset) : undefined
  const offerDecimals = offerAsset ? findDecimals(offerAsset) : undefined
  const askTokenItem = askAsset ? findTokenItem(askAsset) : undefined
  const askDecimals = askAsset ? findDecimals(askAsset) : undefined

  const amount = toAmount(input, { decimals: offerDecimals })

  const swapAssets = () => {
    setValue("offerAsset", askAsset)
    setValue("askAsset", offerAsset)
    setValue("input", undefined)
    trigger("input")
  }

  /* simulate | execute */
  const params = { amount, ...assets }
  const availableSwapModes = getAvailableSwapModes(assets)
  const isSwapAvailable = getIsSwapAvailable(assets)
  const simulateQuery = getSimulateQuery(params)

  /* simulate */
  const { data: simulationResults, isFetching } = useQuery({
    ...simulateQuery,
    onSuccess: ({ profitable }) => setValue("mode", profitable?.mode),
  })

  /* Simulated value to create tx */
  // Simulated for all possible modes
  // Do not simulate again even if the mode changes
  const results = simulationResults?.values
  const result = results && mode && results[mode]
  const simulatedValue = result?.value
  const simulatedRatio = result?.ratio

  useEffect(() => {
    // Set ratio on simulate
    if (simulatedRatio) setValue("ratio", simulatedRatio)
  }, [simulatedRatio, setValue])

  /* Select asset */
  const onSelectAsset = (key: "offerAsset" | "askAsset") => {
    return async (value: Token) => {
      const assets = {
        offerAsset: { offerAsset: value, askAsset },
        askAsset: { offerAsset, askAsset: value },
      }[key]

      // set mode if only one available
      const availableSwapModes = getAvailableSwapModes(assets)
      const availableSwapMode =
        availableSwapModes?.length === 1 ? availableSwapModes[0] : undefined
      setValue("mode", availableSwapMode)

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
  const createTx = useCallback(
    (values: TxValues) => {
      const { mode, offerAsset, askAsset, input, slippageInput, ratio } = values
      if (!(mode && input && offerAsset && askAsset && slippageInput && ratio))
        return

      const offerDecimals = findDecimals(offerAsset)
      const amount = toAmount(input, { decimals: offerDecimals })
      if (!balance || new BigNumber(amount).gt(balance)) return

      const params = { amount, offerAsset, askAsset }
      if (!validateParams(params)) return

      const getMsgs = getMsgsFunction(mode)

      /* slippage */
      const expected = calcExpected({ ...params, input, slippageInput, ratio })
      return { msgs: getMsgs({ ...params, ...expected }) }
    },
    [balance, calcExpected, findDecimals, getMsgsFunction]
  )

  /* fee */
  const { data: estimationTxValues } = useQuery(
    ["estimationTxValues", { mode, assets, balance }],
    async () => {
      if (!(mode && validateAssets(assets) && balance)) return
      const { offerAsset, askAsset } = assets
      const simulate = getSimulateFunction(mode)
      // estimate fee only after ratio simulated
      const { ratio } = await simulate({ ...assets, amount: balance })
      const input = toInput(balance, findDecimals(offerAsset))
      return { mode, offerAsset, askAsset, ratio, input, slippageInput: 1 }
    }
  )

  const token = offerAsset
  const decimals = offerDecimals
  const tx = {
    token,
    decimals,
    amount,
    balance,
    initialGasDenom,
    estimationTxValues,
    createTx,
    preventTax: mode === SwapMode.ONCHAIN,
    onPost: () => {
      // add custom token on ask cw20
      if (!(askAsset && AccAddress.validate(askAsset) && askTokenItem)) return
      const { balance, ...rest } = askTokenItem
      add(rest as CustomTokenCW20)
    },
    queryKeys: [offerAsset, askAsset]
      .filter((asset) => asset && AccAddress.validate(asset))
      .map((token) => [
        queryKey.wasm.contractQuery,
        token,
        { balance: address },
      ]),
  }

  const disabled = isFetching ? t("Simulating...") : false

  /* render */
  const renderRadioGroup = () => {
    if (!(validateAssets(assets) && isSwapAvailable)) return null

    return (
      <section className={styles.modes}>
        {availableSwapModes.map((key) => {
          const checked = mode === key

          return (
            <RadioButton
              {...register("mode")}
              value={key}
              checked={checked}
              key={key}
            >
              {key}
            </RadioButton>
          )
        })}
      </section>
    )
  }

  /* render: expected price */
  const renderExpected = () => {
    if (!(mode && validateSlippageParams(slippageParams))) return null
    const expected = calcExpected(slippageParams)
    const props = { mode, ...slippageParams, ...expected, ...result }
    return <ExpectedPrice {...props} isLoading={isFetching} />
  }

  const slippageDisabled = [offerAsset, askAsset].every(isDenomTerra)

  return (
    <Tx {...tx} disabled={disabled}>
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          {renderRadioGroup()}

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

          {validateAssets(assets) && !isSwapAvailable && (
            <FormError>{t("Pair does not exist")}</FormError>
          )}

          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default SwapForm
