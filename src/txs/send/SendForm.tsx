import { useCallback, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import PersonIcon from "@mui/icons-material/Person"
import { AccAddress } from "@terra-money/terra.js"
import { MsgExecuteContract, MsgSend } from "@terra-money/terra.js"
import { isDenom, toAmount, truncate } from "@terra.kitchen/utils"
import { SAMPLE_ADDRESS } from "config/constants"
import { queryKey } from "data/query"
import { useAddress } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { useTnsAddress } from "data/external/tns"
import { ExternalLink } from "components/general"
import { Auto, Card, Grid, InlineFlex } from "components/layout"
import { Form, FormItem, FormHelp, Input, FormWarning } from "components/form"
import AddressBookList from "../AddressBook/AddressBookList"
import { getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Tx, { getInitialGasDenom } from "../Tx"

interface TxValues {
  recipient?: string // AccAddress | TNS
  address?: AccAddress // hidden input
  input?: number
  memo?: string
}

interface Props extends TokenItem {
  decimals: number
  balance: Amount
}

const SendForm = ({ token, decimals, balance }: Props) => {
  const { t } = useTranslation()
  const connectedAddress = useAddress()
  const bankBalance = useBankBalance()

  /* tx context */
  const initialGasDenom = getInitialGasDenom(bankBalance)

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { register, trigger, watch, setValue, setError, handleSubmit } = form
  const { formState } = form
  const { errors } = formState
  const { recipient, input, memo } = watch()
  const amount = toAmount(input, { decimals })

  const onClickAddressBookItem = async ({ recipient, memo }: AddressBook) => {
    setValue("recipient", recipient)
    setValue("memo", memo)
    await trigger("recipient")
  }

  /* resolve recipient */
  const { data: resolvedAddress, ...tnsState } = useTnsAddress(recipient ?? "")
  useEffect(() => {
    if (!recipient) {
      setValue("address", undefined)
    } else if (AccAddress.validate(recipient)) {
      setValue("address", recipient)
      form.setFocus("input")
    } else if (resolvedAddress) {
      setValue("address", resolvedAddress)
    } else {
      setValue("address", recipient)
    }
  }, [form, recipient, resolvedAddress, setValue])

  // validate(tns): not found
  const invalid =
    recipient?.endsWith(".ust") && !tnsState.isLoading && !resolvedAddress
      ? t("Address not found")
      : ""

  const disabled =
    invalid || (tnsState.isLoading && t("Searching for address..."))

  useEffect(() => {
    if (invalid) setError("recipient", { type: "invalid", message: invalid })
  }, [invalid, setError])

  /* tx */
  const createTx = useCallback(
    ({ address, input, memo }: TxValues) => {
      if (!connectedAddress) return
      if (!(address && AccAddress.validate(address))) return
      const amount = toAmount(input, { decimals })
      const execute_msg = { transfer: { recipient: address, amount } }

      const msgs = isDenom(token)
        ? [new MsgSend(connectedAddress, address, amount + token)]
        : [new MsgExecuteContract(connectedAddress, token, execute_msg)]

      return { msgs, memo }
    },
    [connectedAddress, decimals, token]
  )

  /* fee */
  const estimationTxValues = useMemo(
    () => ({ address: connectedAddress, input: toInput(balance, decimals) }),
    [connectedAddress, balance, decimals]
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
    disabled,
    onChangeMax,
    onSuccess: { label: t("Wallet"), path: "/wallet" },
    queryKeys: AccAddress.validate(token)
      ? [[queryKey.wasm.contractQuery, token, { balance: connectedAddress }]]
      : undefined,
  }

  const bridge = (
    <ExternalLink href="https://bridge.terra.money">Terra Bridge</ExternalLink>
  )

  const renderResolvedAddress = () => {
    if (!resolvedAddress) return null
    return (
      <InlineFlex gap={4} className="success">
        <PersonIcon fontSize="inherit" />
        {truncate(resolvedAddress)}
      </InlineFlex>
    )
  }

  return (
    <Auto
      columns={[
        <Card isFetching={tnsState.isLoading}>
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
                  extra={renderResolvedAddress()}
                  error={errors.recipient?.message ?? errors.address?.message}
                >
                  <Input
                    {...register("recipient", {
                      validate: validate.recipient(),
                    })}
                    placeholder={SAMPLE_ADDRESS}
                    autoFocus
                  />

                  <input {...register("address")} readOnly hidden />
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
