import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { AccAddress, MsgUpdateContractAdmin } from "@terra-money/terra.js"
import { useAddress } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { Form, FormItem } from "components/form"
import { Input } from "components/form"
import validate from "../validate"
import Tx, { getInitialGasDenom } from "../Tx"

interface TxValues {
  new_admin?: string
}

const UpdateAdminContractForm = ({ contract }: { contract: AccAddress }) => {
  const { t } = useTranslation()

  const address = useAddress()
  const bankBalance = useBankBalance()

  /* tx context */
  const initialGasDenom = getInitialGasDenom(bankBalance)

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { register, watch, handleSubmit, formState } = form
  const { errors } = formState
  const values = watch()

  /* tx */
  const createTx = useCallback(
    ({ new_admin }: TxValues) => {
      if (!address || !new_admin) return
      const msgs = [new MsgUpdateContractAdmin(address, new_admin, contract)]
      return { msgs }
    },
    [address, contract]
  )

  /* fee */
  const estimationTxValues = useMemo(() => values, [values])

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
          <FormItem label={t("New admin")} error={errors.new_admin?.message}>
            <Input
              {...register("new_admin", {
                required: "New admin is required",
                validate: validate.address(),
              })}
              autoFocus
            />
          </FormItem>

          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default UpdateAdminContractForm
