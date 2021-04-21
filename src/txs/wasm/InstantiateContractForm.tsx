import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useFieldArray, useForm } from "react-hook-form"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import { isDenomTerraNative, readDenom } from "@terra.kitchen/utils"
import { AccAddress } from "@terra-money/terra.js"
import { MsgInstantiateContract } from "@terra-money/terra.js"
import { SAMPLE_ADDRESS } from "config/constants"
import { sortCoins } from "utils/coin"
import { parseJSON, validateMsg } from "utils/data"
import { useAddress } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { Form, FormGroup, FormItem } from "components/form"
import { Input, EditorInput, Select } from "components/form"
import { calcTaxes, getCoins, getPlaceholder } from "../utils"
import validate from "../validate"
import Tx, { getInitialGasDenom } from "../Tx"
import { useTaxParams } from "./TaxParams"

interface TxValues {
  admin?: AccAddress
  id?: number
  msg?: string
  coins: { input?: number; denom: CoinDenom }[]
}

const InstantiateContractForm = () => {
  const { t } = useTranslation()
  const address = useAddress()
  const bankBalance = useBankBalance()

  /* tx context */
  const taxParams = useTaxParams()
  const initialGasDenom = getInitialGasDenom(bankBalance)
  const defaultItem = { denom: initialGasDenom }

  /* form */
  const form = useForm<TxValues>({
    mode: "onChange",
    defaultValues: { coins: [defaultItem] },
  })

  const { register, control, watch, handleSubmit, formState } = form
  const { errors } = formState
  const values = watch()
  const { coins } = values
  const { fields, append, remove } = useFieldArray({ control, name: "coins" })

  /* tx */
  const createTx = useCallback(
    ({ admin, id, msg, ...values }: TxValues) => {
      if (!address || !(id && msg)) return
      if (!validateMsg(msg)) return

      const init_msg = parseJSON(msg)
      const coins = getCoins(values.coins)
      const msgs = [
        new MsgInstantiateContract(address, admin, id, init_msg, coins),
      ]

      return { msgs }
    },
    [address]
  )

  /* fee */
  const estimationTxValues = useMemo(() => values, [values])
  const taxes = calcTaxes(coins, taxParams)

  const tx = {
    initialGasDenom,
    estimationTxValues,
    taxes,
    createTx,
    onSuccess: { label: t("Contract"), path: "/contract" },
  }

  const length = fields.length
  return (
    <Tx {...tx}>
      {({ fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <FormItem
            label={`${t("Admin")} (${t("optional")})`}
            error={errors.admin?.message}
          >
            <Input
              {...register("admin", {
                validate: validate.address("Admin", true),
              })}
              placeholder={SAMPLE_ADDRESS}
            />
          </FormItem>

          <FormItem label={t("Code ID")} error={errors.id?.message}>
            <Input
              {...register("id", {
                valueAsNumber: true,
                required: "Code ID is required",
                min: {
                  value: 0,
                  message: "Code ID must be a positive integer",
                },
                validate: {
                  integer: (value) =>
                    Number.isInteger(value) || "Code ID must be an integer",
                },
              })}
              inputMode="decimal"
              placeholder="1"
              autoFocus
            />
          </FormItem>

          <FormItem
            label="Init msg" // do not translate this
            error={errors.msg?.message}
          >
            <EditorInput {...register("msg", { validate: validate.msg() })} />
          </FormItem>

          <FormItem label={t("Amount")}>
            {fields.map(({ id }, index) => (
              <FormGroup
                button={
                  length - 1 === index
                    ? {
                        onClick: () => append(defaultItem),
                        children: <AddIcon style={{ fontSize: 18 }} />,
                      }
                    : {
                        onClick: () => remove(index),
                        children: <RemoveIcon style={{ fontSize: 18 }} />,
                      }
                }
                key={id}
              >
                <Input
                  {...register(`coins.${index}.input`, {
                    valueAsNumber: true,
                  })}
                  inputMode="decimal"
                  placeholder={getPlaceholder()}
                  selectBefore={
                    <Select {...register(`coins.${index}.denom`)} before>
                      {sortCoins(bankBalance)
                        .filter(({ denom }) => isDenomTerraNative(denom))
                        .map(({ denom }) => (
                          <option value={denom} key={denom}>
                            {readDenom(denom)}
                          </option>
                        ))}
                    </Select>
                  }
                />
              </FormGroup>
            ))}
          </FormItem>

          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default InstantiateContractForm
