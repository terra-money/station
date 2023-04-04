import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { MsgDeposit } from "@terra-money/feather.js"
import { toAmount } from "@terra-money/terra-utils"
import { queryKey } from "data/query"
import { useBankBalance } from "data/queries/bank"
import { Form, FormItem, Input } from "components/form"
import useProposalId from "pages/gov/useProposalId"
import { getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Tx from "../Tx"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { useNetwork } from "data/wallet"

interface TxValues {
  input?: number
}

const DepositForm = () => {
  const { t } = useTranslation()
  const { id, chain } = useProposalId()
  const addresses = useInterchainAddresses()
  const networks = useNetwork()

  const bankBalance = useBankBalance()
  const balance =
    bankBalance.find((b) => b.denom === networks[chain].baseAsset)?.amount ??
    "0"

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { register, trigger, watch, setValue, handleSubmit, formState } = form
  const { errors } = formState
  const { input } = watch()
  const amount = toAmount(input)

  /* tx */
  const createTx = useCallback(
    ({ input }: TxValues) => {
      if (!addresses) return
      const amount = toAmount(input)
      const msgs = [
        new MsgDeposit(
          Number(id),
          addresses[chain],
          amount + networks[chain].baseAsset
        ),
      ]
      return { msgs, chainID: chain }
    },
    [addresses, id, chain, networks]
  )

  /* fee */
  const estimationTxValues = useMemo(
    () => ({ input: toInput(balance) }),
    [balance]
  )

  const onChangeMax = useCallback(
    async (input: number) => {
      setValue("input", input)
      await trigger("input")
    },
    [setValue, trigger]
  )

  const tx = {
    token: networks[chain].baseAsset,
    amount,
    balance,
    estimationTxValues,
    createTx,
    onChangeMax,
    queryKeys: [[queryKey.gov.deposits, id]],
    chain,
  }

  return (
    <Tx {...tx}>
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <FormItem
            label={t("Amount")}
            extra={max.render()}
            error={errors.input?.message}
          >
            <Input
              {...register("input", {
                valueAsNumber: true,
                validate: validate.input(toInput(max.amount)),
              })}
              token={networks[chain].baseAsset}
              onFocus={max.reset}
              inputMode="decimal"
              placeholder={getPlaceholder()}
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

export default DepositForm
