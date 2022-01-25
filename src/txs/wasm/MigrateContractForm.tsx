import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { AccAddress, MsgMigrateContract } from "@terra-money/terra.js"
import { parseJSON, validateMsg } from "utils/data"
import { useAddress } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { Form, FormItem } from "components/form"
import { Input, EditorInput } from "components/form"
import validate from "../validate"
import Tx, { getInitialGasDenom } from "../Tx"

interface TxValues {
  id?: number
  msg?: string
}

const MigrateContractForm = ({ contract }: { contract: AccAddress }) => {
  const { t } = useTranslation()

  const address = useAddress()
  const bankBalance = useBankBalance()

  /* tx context */
  const initialGasDenom = getInitialGasDenom(bankBalance)

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { register, watch, handleSubmit, formState } = form
  const { errors } = formState
  
  /* fee */
  const estimationTxValues = watch()

  /* tx */
  const createTx = useCallback(
    ({ id, msg }: TxValues) => {
      if (!address || !(id && msg)) return
      if (!validateMsg(msg)) return

      const migrate_msg = parseJSON(msg)
      const msgs = [new MsgMigrateContract(address, contract, id, migrate_msg)]

      return { msgs }
    },
    [address, contract]
  )


  const tx = {
    initialGasDenom,
    estimationTxValues,
    createTx,
    onSuccess: { label: t("Contract"), path: "/contract" },
  }

  return (
    <Tx {...tx}>
      {({ fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
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
            label="Migrate msg" // do not translate this
            error={errors.msg?.message}
          >
            <EditorInput {...register("msg", { validate: validate.msg() })} />
          </FormItem>

          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default MigrateContractForm
