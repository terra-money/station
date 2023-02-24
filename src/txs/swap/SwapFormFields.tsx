import { FormArrow, FormWarning } from "components/form"
import { useEffect, useMemo } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"
import AssetFormItem, {
  AssetInput,
  AssetReadOnly,
} from "./components/AssetFormItem"
import { SwapFormState } from "./hooks/useSwapForm"
import { getPlaceholder, toInput } from "txs/utils"
import { TokenInput } from "./components/TokenInput"
import { useCurrentChainTokens } from "./CurrentChainTokensContext"
import { useRangoQuote } from "data/external/rango"
import { microfy } from "utils/microfy"
import { Read } from "components/token"
import SlippageControl from "./components/SlippageControl"
import validate from "txs/validate"
import { RenderMax } from "txs/Tx"
import BigNumber from "bignumber.js"

interface SwapFormFieldsProps {
  form: SwapFormState

  maxAmount: string
  renderMax: RenderMax
  resetMax: () => void
}

export const SwapFormFields = ({
  form,
  maxAmount,
  renderMax,
  resetMax,
}: SwapFormFieldsProps) => {
  const { t } = useTranslation()

  const { tokens, tokensRecord } = useCurrentChainTokens()

  const {
    formState,
    watch,
    setValue,
    resetField,
    register,
    trigger,
    setFocus,
  } = form
  const { errors, isValid } = formState
  const values = watch()
  const { offerAsset, askAsset, amount, slippage } = values

  useEffect(() => {
    resetField("amount")
    setFocus("amount")
  }, [resetField, setFocus, offerAsset])

  const swapAssets = () => {
    setValue("offerAsset", askAsset)
    setValue("askAsset", offerAsset)
    resetField("amount")
    trigger("amount")
  }

  const { data: quote, isFetching: isFetchingQuote } = useRangoQuote(
    useMemo(() => {
      if (!isValid) return

      const from = tokensRecord[offerAsset]
      const to = tokensRecord[askAsset]
      return {
        from,
        to,
        amount: microfy(amount, from.decimals),
      }
    }, [amount, askAsset, isValid, offerAsset, tokensRecord])
  )

  // if failed to get the balance and max amount resulted in zero - no need to validate
  // TO-DO: return undefined instead of 0 when failed to get the balance
  const validateAmount = new BigNumber(maxAmount).gt(0)
    ? validate.input(
        toInput(maxAmount, tokensRecord[offerAsset].decimals),
        tokensRecord[offerAsset].decimals
      )
    : undefined

  return (
    <>
      <FormWarning>
        {t("Leave coins to pay fees for subsequent transactions")}
      </FormWarning>

      <AssetFormItem
        extra={renderMax(async (value) => {
          // Do not use automatic max here
          // Confusion arises as the amount changes and simulates again
          if (offerAsset) {
            setValue(
              "amount",
              toInput(value, tokensRecord[offerAsset].decimals)
            )
            await trigger("amount")
          }
        })}
        label={t("From")}
        error={errors.amount?.message}
      >
        <Controller
          name="offerAsset"
          control={form.control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <TokenInput
              value={value}
              onChange={onChange}
              options={tokens}
              addonAfter={
                <AssetInput
                  {...register("amount", {
                    required: true,
                    valueAsNumber: true,
                    validate: validateAmount,
                  })}
                  inputMode="decimal"
                  onFocus={resetMax}
                  placeholder={
                    offerAsset
                      ? getPlaceholder(tokensRecord[offerAsset].decimals)
                      : undefined
                  }
                  autoFocus
                />
              }
            />
          )}
        />
      </AssetFormItem>

      <FormArrow onClick={swapAssets} />

      <AssetFormItem label={t("To")}>
        <Controller
          name="askAsset"
          control={form.control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <TokenInput
              value={value}
              onChange={onChange}
              options={tokens}
              addonAfter={
                <AssetReadOnly>
                  {" "}
                  {quote ? (
                    <Read
                      amount={quote.route?.outputAmount}
                      decimals={tokensRecord[askAsset].decimals}
                      approx
                    />
                  ) : (
                    <p className="muted">
                      {isFetchingQuote ? t("Simulating...") : "0"}
                    </p>
                  )}
                </AssetReadOnly>
              }
            />
          )}
        />
      </AssetFormItem>

      <SlippageControl
        {...register("slippage", {
          valueAsNumber: true,
          validate: validate.input(50, 2, "Slippage tolerance"),
        })}
        input={slippage}
        inputMode="decimal"
        placeholder={getPlaceholder(2)}
        error={errors.slippage?.message}
      />
    </>
  )
}
