import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { AccAddress, MsgUpdateContractAdmin } from "@terra-money/terra.js"
import { useAddress } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { Form, FormItem } from "components/form"
import { Input, EditorInput } from "components/form"
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
      // Prepare an UpdateAdmin message with :
      // the current address as the Admin value
      // a new_admin for the proposed new contract admin address
      // the contract upon which to update the admin for
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
          <FormItem label={t("New Admin")} error={errors.new_admin?.message}>
            <Input
              {...register("new_admin", {
                required: "New Admin Address must be provided",
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
