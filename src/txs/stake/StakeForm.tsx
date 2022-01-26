import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { AccAddress, Coin, ValAddress } from "@terra-money/terra.js"
import { Delegation, Validator } from "@terra-money/terra.js"
import { MsgDelegate, MsgUndelegate } from "@terra-money/terra.js"
import { MsgBeginRedelegate } from "@terra-money/terra.js"
import { toAmount } from "@terra.kitchen/utils"
import { getAmount } from "utils/coin"
import { queryKey } from "data/query"
import { useAddress } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { getFindMoniker } from "data/queries/staking"
import { Grid } from "components/layout"
import { Form, FormItem, FormWarning, Input, Select } from "components/form"
import { getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Tx, { getInitialGasDenom } from "../Tx"

interface TxValues {
  source?: ValAddress
  input?: number
}

export enum StakeAction {
  DELEGATE = "delegate",
  REDELEGATE = "redelegate",
  UNBOND = "undelegate",
}

interface Props {
  tab: StakeAction
  destination: ValAddress
  validators: Validator[]
  delegations: Delegation[]
}

const StakeForm = ({ tab, destination, validators, delegations }: Props) => {
  const { t } = useTranslation()
  const address = useAddress()
  const bankBalance = useBankBalance()
  const findMoniker = getFindMoniker(validators)

  const delegationsOptions = delegations.filter(
    ({ validator_address }) =>
      tab !== StakeAction.REDELEGATE || validator_address !== destination
  )

  const defaultSource = delegationsOptions[0]?.validator_address
  const findDelegation = (address: AccAddress) =>
    delegationsOptions.find(
      ({ validator_address }) => validator_address === address
    )

  /* tx context */
  const initialGasDenom = getInitialGasDenom(bankBalance)

  /* form */
  const form = useForm<TxValues>({
    mode: "onChange",
    defaultValues: { source: defaultSource },
  })

  const { register, trigger, watch, setValue, handleSubmit, formState } = form
  const { errors } = formState
  const { source, input } = watch()
  const amount = toAmount(input)

  /* tx */
  const createTx = useCallback(
    ({ input, source }: TxValues) => {
      if (!address) return

      const amount = toAmount(input)
      const coin = new Coin("uluna", amount)

      if (tab === StakeAction.REDELEGATE) {
        if (!source) return
        const msg = new MsgBeginRedelegate(address, source, destination, coin)
        return { msgs: [msg] }
      }

      const msgs = {
        [StakeAction.DELEGATE]: [new MsgDelegate(address, destination, coin)],
        [StakeAction.UNBOND]: [new MsgUndelegate(address, destination, coin)],
      }[tab]

      return { msgs }
    },
    [address, destination, tab]
  )

  /* fee */
  const balance = {
    [StakeAction.DELEGATE]: getAmount(bankBalance, "uluna"),
    [StakeAction.REDELEGATE]:
      (source && findDelegation(source)?.balance.amount.toString()) ?? "0",
    [StakeAction.UNBOND]:
      findDelegation(destination)?.balance.amount.toString() ?? "0",
  }[tab]

  const estimationTxValues = useMemo(() => {
    return {
      input: toInput(balance),
      // to check redelegation stacks
      source: tab === StakeAction.REDELEGATE ? source : undefined,
    }
  }, [balance, source, tab])

  const onChangeMax = useCallback(
    async (input: number) => {
      setValue("input", input)
      await trigger("input")
    },
    [setValue, trigger]
  )

  const token = tab === StakeAction.DELEGATE ? "uluna" : ""
  const tx = {
    token,
    amount,
    balance,
    initialGasDenom,
    estimationTxValues,
    createTx,
    onChangeMax,
    onSuccess: {
      label: findMoniker(destination),
      path: `/validator/${destination}`,
    },
    queryKeys: [
      queryKey.staking.delegations,
      queryKey.staking.unbondings,
      queryKey.distribution.rewards,
    ],
  }

  return (
    <Tx {...tx}>
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          {
            {
              [StakeAction.DELEGATE]: (
                <FormWarning>
                  {t(
                    "Leave enough amount of coins to pay fee for subsequent transactions"
                  )}
                </FormWarning>
              ),
              [StakeAction.REDELEGATE]: (
                <FormWarning>
                  {t(
                    "21 days must pass after this transaction to redelegate to this validator again"
                  )}
                </FormWarning>
              ),
              [StakeAction.UNBOND]: (
                <Grid gap={4}>
                  <FormWarning>
                    {t(
                      "Maximum 7 undelegations can be in progress at the same time"
                    )}
                  </FormWarning>
                  <FormWarning>
                    {t(
                      "No reward is distributed during 21 days undelegation period"
                    )}
                  </FormWarning>
                </Grid>
              ),
            }[tab]
          }

          {tab === StakeAction.REDELEGATE && (
            <FormItem label={t("From")}>
              <Select
                {...register("source", {
                  required:
                    tab === StakeAction.REDELEGATE
                      ? "Source validator is required"
                      : false,
                })}
              >
                {delegationsOptions
                  ?.filter(
                    ({ validator_address }) => validator_address !== destination
                  )
                  .map(({ validator_address }) => (
                    <option value={validator_address} key={validator_address}>
                      {findMoniker(validator_address)}
                    </option>
                  ))}
              </Select>
            </FormItem>
          )}

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
              token="uluna"
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

export default StakeForm
