import { FormArrow, FormWarning } from "components/form"
import { useEffect, useState } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"
import AssetFormItem, {
  AssetInput,
  AssetReadOnly,
} from "./components/AssetFormItem"
import SelectToken from "./components/SelectToken"
import { Checkbox } from "components/form"
import { useMultichainSwap } from "./MultichainSwapContext"
import ChainInput, { ChainOption } from "components/form/ChainInput"
import { SwapFormState } from "./hooks/useSwapForm"
import { useSwapSimulation } from "./hooks/useSwapSimulation"
import { Read } from "components/token"
import { getPlaceholder } from "txs/utils"

interface SwapFormFieldsProps {
  form: SwapFormState
}

export const SwapFormFields = ({ form }: SwapFormFieldsProps) => {
  const { t } = useTranslation()

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
  const { offerAsset, askAsset, sourceChain, destinationChain } = values

  useEffect(() => {
    resetField("amount")
    setFocus("amount")
  }, [resetField, setFocus, offerAsset])

  const [showAll, setShowAll] = useState(false)

  const { chains } = useMultichainSwap()
  const chainOptions: ChainOption[] = chains.map((chain) => ({
    id: chain.chain_id,
    name: chain.name,
    icon: chain.image_url,
  }))

  const swapAssets = () => {
    setValue("offerAsset", askAsset)
    setValue("askAsset", offerAsset)
    resetField("amount")
    trigger("amount")
  }

  const { data: simulation, isFetching: isFetchingSimulation } =
    useSwapSimulation(form)

  return (
    <>
      <FormWarning>
        {t("Leave coins to pay fees for subsequent transactions")}
      </FormWarning>

      <Controller
        name="sourceChain"
        control={form.control}
        render={({ field: { value, onChange } }) => (
          <ChainInput
            options={chainOptions}
            value={value}
            onChange={(chain) => {
              onChange(chain)
              resetField("offerAsset")
            }}
          />
        )}
      />

      <AssetFormItem label={t("From")} error={errors.amount?.message}>
        <Controller
          name="offerAsset"
          control={form.control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <SelectToken
              chainId={sourceChain}
              value={value}
              onChange={onChange}
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
                    offerAsset ? getPlaceholder(offerAsset.decimals) : undefined
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

      <Controller
        name="destinationChain"
        control={form.control}
        render={({ field: { value, onChange } }) => (
          <ChainInput
            options={chainOptions}
            value={value}
            onChange={(chain) => {
              onChange(chain)
              resetField("askAsset")
            }}
          />
        )}
      />

      <AssetFormItem label={t("To")}>
        <Controller
          name="askAsset"
          control={form.control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <SelectToken
              chainId={destinationChain}
              value={value}
              onChange={onChange}
              addonAfter={
                <AssetReadOnly>
                  {simulation ? (
                    <Read
                      amount={simulation.simulatedAmount}
                      decimals={askAsset.decimals}
                      approx
                    />
                  ) : (
                    <p className="muted">
                      {isFetchingSimulation ? t("Simulating...") : "0"}
                    </p>
                  )}
                </AssetReadOnly>
              }
            />
          )}
        />
      </AssetFormItem>
    </>
  )
}
