import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useFieldArray, useForm } from "react-hook-form"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import { AccAddress } from "@terra-money/feather.js"
import { MsgInstantiateContract } from "@terra-money/feather.js"
import { SAMPLE_ADDRESS } from "config/constants"
import { parseJSON, validateMsg } from "utils/data"
import { useNetwork } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { WithTokenItem } from "data/token"
import { Form, FormGroup, FormItem } from "components/form"
import { Input, EditorInput, Select } from "components/form"
import { getCoins, getPlaceholder } from "../utils"
import validate from "../validate"
import Tx from "../Tx"
import { useIBCHelper } from "../IBCHelperContext"
import { useInterchainAddresses } from "auth/hooks/useAddress"

interface TxValues {
  admin?: AccAddress
  id?: number
  msg?: string
  coins: { input?: number; denom: CoinDenom }[]
  label?: string
}

// TODO: make this interchain
const InstantiateContractForm = ({ chainID }: { chainID: string }) => {
  const { t } = useTranslation()
  const addresses = useInterchainAddresses()
  const address = addresses && addresses[chainID]
  const network = useNetwork()
  const bankBalance = useBankBalance()

  /* tx context */
  const defaultItem = { denom: network[chainID].baseAsset }
  const { findDecimals } = useIBCHelper()

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
    ({ id, msg, label, ...values }: TxValues) => {
      if (!address || !(id && msg)) return
      if (!validateMsg(msg)) return

      const admin = values.admin || undefined
      const code_id = Number(id)
      const init_msg = parseJSON(msg)
      const coins = getCoins(values.coins, findDecimals)
      const msgs = [
        new MsgInstantiateContract(
          address,
          admin,
          code_id,
          init_msg,
          coins,
          label || undefined
        ),
      ]

      return { msgs, chainID }
    },
    [address, chainID, findDecimals]
  )

  /* fee */
  const estimationTxValues = useMemo(() => values, [values])

  const tx = {
    estimationTxValues,
    coins,
    createTx,
    taxRequired: true,
    chain: chainID,
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
            {fields.map(({ id }, index) => {
              const { denom } = fields[index]
              const decimals = findDecimals(denom)

              return (
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
                    placeholder={getPlaceholder(decimals)}
                    selectBefore={
                      <Select {...register(`coins.${index}.denom`)} before>
                        {bankBalance
                          .filter(({ chain }) => chain === chainID)
                          .map(({ denom }) => (
                            <WithTokenItem token={denom} key={denom}>
                              {({ symbol }) => (
                                <option value={denom}>{symbol}</option>
                              )}
                            </WithTokenItem>
                          ))}
                      </Select>
                    }
                  />
                </FormGroup>
              )
            })}
          </FormItem>

          <FormItem label={t("Label")} error={errors.label?.message}>
            <Input {...register("label")} />
          </FormItem>

          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default InstantiateContractForm
