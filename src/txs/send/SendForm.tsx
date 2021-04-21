import { useCallback, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { AccAddress } from "@terra-money/terra.js"
import { MsgExecuteContract, MsgSend } from "@terra-money/terra.js"
import { isDenom, toAmount } from "@terra.kitchen/utils"
import { SAMPLE_ADDRESS } from "config/constants"
import { queryKey } from "data/query"
import { useAddress } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { ExternalLink } from "components/general"
import { Auto, Card, Grid } from "components/layout"
import { Form, FormItem, FormHelp, Input, FormWarning } from "components/form"
import AddressBookList from "../AddressBook/AddressBookList"
import { getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Tx, { getInitialGasDenom } from "../Tx"

interface TxValues {
  recipient?: AccAddress
  input?: number
  memo?: string
}

interface Props extends TokenItem {
  decimals: number
  balance: Amount
}

const SendForm = ({ token, decimals, balance }: Props) => {
  const { t } = useTranslation()
  const address = useAddress()
  const bankBalance = useBankBalance()

  /* tx context */
  const initialGasDenom = getInitialGasDenom(bankBalance, token)

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { register, trigger, watch, setValue, handleSubmit, formState } = form
  const { errors } = formState
  const { recipient, input, memo } = watch()
  const amount = toAmount(input, { decimals })

  const onClickAddressBookItem = async ({ recipient, memo }: AddressBook) => {
    setValue("recipient", recipient)
    setValue("memo", memo)
    await trigger("recipient")
  }

  useEffect(() => {
    if (recipient && AccAddress.validate(recipient)) form.setFocus("input")
  }, [form, recipient])

  /* tx */
  const createTx = useCallback(
    ({ recipient, input, memo }: TxValues) => {
      if (!address || !recipient) return
      const amount = toAmount(input, { decimals })
      const execute_msg = { transfer: { recipient, amount } }

      const msgs = isDenom(token)
        ? [new MsgSend(address, recipient, amount + token)]
        : [new MsgExecuteContract(address, token, execute_msg)]

      return { msgs, memo }
    },
    [address, decimals, token]
  )

  /* fee */
  const estimationTxValues = useMemo(
    () => ({ recipient: address, input: toInput(balance, decimals) }),
    [address, balance, decimals]
  )

  const onChangeMax = useCallback(
    async (input: number) => {
      setValue("input", input)
      await trigger("input")
    },
    [setValue, trigger]
  )

  const tx = {
    token,
    decimals,
    amount,
    balance,
    initialGasDenom,
    estimationTxValues,
    createTx,
    onChangeMax,
    onSuccess: { label: t("Wallet"), path: "/wallet" },
    queryKeys: AccAddress.validate(token)
      ? [[queryKey.wasm.contractQuery, token, { balance: address }]]
      : undefined,
  }

  const bridge = (
    <ExternalLink href="https://bridge.terra.money">Terra Bridge</ExternalLink>
  )

  return (
    <Auto
      columns={[
        <Card>
          <Tx {...tx}>
            {({ max, fee, submit }) => (
              <Form onSubmit={handleSubmit(submit.fn)}>
                <Grid gap={4}>
                  <FormHelp>Use {bridge} for interchain transfers</FormHelp>
                  {!memo && (
                    <FormWarning>
                      {t("Check if this transaction requires a memo")}
                    </FormWarning>
                  )}
                </Grid>

                <FormItem
                  label={t("Recipient")}
                  error={errors.recipient?.message}
                >
                  <Input
                    {...register("recipient", {
                      validate: validate.address(),
                    })}
                    placeholder={SAMPLE_ADDRESS}
                    autoFocus
                  />
                </FormItem>

                <FormItem
                  label={t("Amount")}
                  extra={max.render()}
                  error={errors.input?.message}
                >
                  <Input
                    {...register("input", {
                      valueAsNumber: true,
                      validate: validate.input(
                        toInput(max.amount, decimals),
                        decimals
                      ),
                    })}
                    token={token}
                    inputMode="decimal"
                    onFocus={max.reset}
                    placeholder={getPlaceholder(decimals)}
                  />
                </FormItem>

                <FormItem
                  label={`${t("Memo")} (${t("optional")})`}
                  error={errors.memo?.message}
                >
                  <Input
                    {...register("memo", {
                      validate: {
                        size: validate.size(256, "Memo"),
                        brackets: validate.memo(),
                      },
                    })}
                  />
                </FormItem>

                {fee.render()}
                {submit.button}
              </Form>
            )}
          </Tx>
        </Card>,
        <AddressBookList onClick={onClickAddressBookItem} />,
      ]}
    />
  )
}

export default SendForm
