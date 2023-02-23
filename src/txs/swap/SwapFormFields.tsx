import { FormArrow, FormWarning } from "components/form"
import { useEffect, useMemo } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"
import AssetFormItem, {
  AssetInput,
  AssetReadOnly,
} from "./components/AssetFormItem"
import { SwapFormState } from "./hooks/useSwapForm"
import { getPlaceholder } from "txs/utils"
import { TokenInput } from "./components/TokenInput"
import { useCurrentChainTokens } from "./CurrentChainTokensContext"
import { useRangoQuote } from "data/external/rango"
import { microfy } from "utils/microfy"
import { Read } from "components/token"
import SlippageControl from "./components/SlippageControl"
import validate from "txs/validate"

interface SwapFormFieldsProps {
  form: SwapFormState
}

export const SwapFormFields = ({ form }: SwapFormFieldsProps) => {
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

  return (
    <>
      <FormWarning>
        {t("Leave coins to pay fees for subsequent transactions")}
      </FormWarning>

      <AssetFormItem label={t("From")} error={errors.amount?.message}>
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
                    // validate: validate.input(
                    //   toInput(max.amount, offerDecimals),
                    //   offerDecimals
                    // ),
                  })}
                  inputMode="decimal"
                  placeholder={
                    offerAsset
                      ? getPlaceholder(tokensRecord[offerAsset].decimals)
                      : undefined
                  }
                  // onFocus={max.reset}
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
