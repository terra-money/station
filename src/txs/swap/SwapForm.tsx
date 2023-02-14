import { Form, FormArrow, FormWarning } from "components/form"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import AssetFormItem, {
  AssetInput,
  AssetReadOnly,
} from "./components/AssetFormItem"
import SelectToken from "./components/SelectToken"
import { Checkbox } from "components/form"
import { SelectChain } from "./components/SelectChain"

interface SwapFormAsset {
  chain: string
  asset: string
}

interface SwapFormShape {
  slippage: number
  offerAsset: SwapFormAsset
  askAsset: SwapFormAsset
  amount?: number
}

/*
TODO:
- [ ] what chains to display?useTFMChains.ts

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

const defaultFormValues: Partial<SwapFormShape> = {
  slippage: 1,
  offerAsset: {
    chain: "terra",
    asset: "uluna",
  },
  askAsset: {
    chain: "terra",
    asset: "uluna",
  },
}

export const SwapForm = () => {
  const { t } = useTranslation()

  const form = useForm<SwapFormShape>({
    mode: "onChange",
    defaultValues: defaultFormValues,
  })

  const { handleSubmit, formState, watch, setValue, register, trigger } = form
  const { errors } = formState
  const values = watch()
  const { offerAsset, askAsset } = values

  const onSelectAsset = (key: "offerAsset" | "askAsset") => {
    return async (asset: Token) => {
      // focus on input if select offer asset
      if (key === "offerAsset") {
        form.resetField("amount")
        form.setFocus("amount")
      }

      setValue(`${key}.asset`, asset)
    }
  }

  const [showAll, setShowAll] = useState(false)

  // const { options, findDecimals } = useTFMSwap()

  // const offerDecimals = offerAsset.asset ? findDecimals(offerAsset.asset) : undefined

  // const getOptions = (key: "offerAsset" | "askAsset") => {
  //   const { coins, tokens } = options

  //   const getOptionList = (list: TokenItemWithBalance[]) =>
  //     list.map((item) => {
  //       const { token: value, balance } = item
  //       const hidden = key === "offerAsset" && !showAll && !has(balance)
  //       return { ...item, value, hidden }
  //     })

  //   return [
  //     { title: t("Coins"), children: getOptionList(coins) },
  //     { title: t("Tokens"), children: getOptionList(tokens) },
  //   ]
  // }

  const swapAssets = () => {
    setValue("offerAsset", askAsset)
    setValue("askAsset", offerAsset)
    setValue("amount", undefined)
    trigger("amount")
  }

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
        name="offerAsset.chain"
        control={form.control}
        render={({ field: { value, onChange } }) => (
          <SelectChain value={value} onChange={onChange} />
        )}
      />

      <AssetFormItem label={t("From")} error={errors.amount?.message}>
        <SelectToken
          value={offerAsset.asset}
          onChange={onSelectAsset("offerAsset")}
          // options={getOptions("offerAsset")}
          options={[]}
          checkbox={
            <Checkbox checked={showAll} onChange={() => setShowAll(!showAll)}>
              {t("Show all")}
            </Checkbox>
          }
          addonAfter={
            <AssetInput
              {...register("amount", {
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
          showName
        />
      </AssetFormItem>

      <FormArrow onClick={swapAssets} />

      <Controller
        name="askAsset.chain"
        control={form.control}
        render={({ field: { value, onChange } }) => (
          <SelectChain value={value} onChange={onChange} />
        )}
      />

      <AssetFormItem label={t("To")}>
        <SelectToken
          value={askAsset.asset}
          onChange={onSelectAsset("askAsset")}
          // options={getOptions("askAsset")}
          options={[]}
          addonAfter={
            <AssetReadOnly>
              {/* {simulatedValue ? (
                <Read
                  amount={simulatedValue}
                  decimals={askDecimals}
                  approx
                />
              ) : (
                <p className="muted">
                  {isFetching ? t("Simulating...") : "0"}
                </p>
              )} */}
            </AssetReadOnly>
          }
          showName
        />
      </AssetFormItem>
    </Form>
  )
}
