import { Form, FormArrow, FormWarning } from "components/form"
import { useState } from "react"
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
import { useSwapForm } from "./hooks/useSwapForm"
import { useSwapSimulation } from "./hooks/useSwapSimulation"
import { TFMToken } from "data/external/multichainTfm"
import { Read } from "components/token"

/*
TODO:
- [ ] what chains to display?useTFMChains.ts
- [ ] include chain icon to to chain input
- [ ] reuse ChainInput and ChainSelector
- [ ] isValid only when ask and offer assets

TODO for SelectToken:
- [ ] group tokens into "Coins" and "Tokens"
- [ ] show loader when fetching tokens
- [ ] show icon for token
- [ ] show token name
- [ ] show token balance

TODO for ChainInput:
- [ ] close on click outside
- [ ] second chain input has small height

TODO from TFMSwapForm:
- [ ] placeholder for offer input
- [ ] options for offer input
- [ ] options for ask input
- [ ] take offer asset from useLocation()
- [ ] extra (max) for the amount input
- [ ] empty opposite asset if select the same asset
- [ ] validate amount against max and offerDecimals
- [ ] max reset on focus
- [ ] simulate value
*/

export const SwapForm = () => {
  const { t } = useTranslation()

  const form = useSwapForm()

  const {
    handleSubmit,
    formState,
    watch,
    setValue,
    resetField,
    register,
    trigger,
  } = form
  const { errors } = formState
  const values = watch()
  const { offerAsset, askAsset, sourceChain, destinationChain } = values

  const onSelectAsset = (key: "offerAsset" | "askAsset") => {
    return async (asset: TFMToken) => {
      // focus on input if select offer asset
      if (key === "offerAsset") {
        form.resetField("amount")
        form.setFocus("amount")
      }

      setValue(key, asset)
    }
  }

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
    <Form
      onSubmit={handleSubmit((values) => {
        console.log(values)
      })}
    >
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
            onChange={onChange}
          />
        )}
      />

      <AssetFormItem label={t("From")} error={errors.amount?.message}>
        <SelectToken
          chainId={sourceChain}
          value={offerAsset}
          onChange={onSelectAsset("offerAsset")}
          checkbox={
            <Checkbox checked={showAll} onChange={() => setShowAll(!showAll)}>
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
              // placeholder={getPlaceholder(offerDecimals)}
              // onFocus={max.reset}
              autoFocus
            />
          }
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
            onChange={onChange}
          />
        )}
      />

      <AssetFormItem label={t("To")}>
        <SelectToken
          chainId={destinationChain}
          value={askAsset}
          onChange={onSelectAsset("askAsset")}
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
      </AssetFormItem>
    </Form>
  )
}
