import { FormArrow, FormWarning } from "components/form"
import { useEffect } from "react"
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
  const { errors } = formState
  const values = watch()
  const { offerAsset, askAsset } = values

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
              addonAfter={<AssetReadOnly>coming soon!</AssetReadOnly>}
            />
          )}
        />
      </AssetFormItem>
    </>
  )
}
