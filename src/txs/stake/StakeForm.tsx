import { ChangeEvent, useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { AccAddress, Coin, ValAddress } from "@terra-money/terra.js"
import { Delegation, Validator } from "@terra-money/terra.js"
import { MsgDelegate, MsgUndelegate } from "@terra-money/terra.js"
import { MsgBeginRedelegate } from "@terra-money/terra.js"
import { MsgWithdrawDelegatorReward } from "@terra-money/terra.js"
import { toAmount, formatNumber } from "@terra.kitchen/utils"
import { getAmount } from "utils/coin"
import { queryKey } from "data/query"
import { useAddress } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { getFindMoniker } from "data/queries/staking"
import { calcRewardsValues, useRewards } from "data/queries/distribution"
import { useCurrency } from "data/settings/Currency"
import { useMemoizedCalcValue } from "data/queries/oracle"
import { Grid } from "components/layout"
import { Form, FormItem, FormWarning, Input, Select } from "components/form"
import { getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Tx, { getInitialGasDenom } from "../Tx"
import { Switch } from "@mui/material"

interface TxValues {
  source?: ValAddress
  input?: number
  node?: ValAddress
}

export enum StakeAction {
  DELEGATE = "delegate",
  REDELEGATE = "redelegate",
  UNBOND = "undelegate",
  REINVEST = "reinvest",
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
  const { data: rewards } = useRewards()
  const calcValue = useMemoizedCalcValue()
  const currency = useCurrency()

  const [checkState, setCheckState] = useState<boolean>(false)

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
  const findCurrentNode = (address: AccAddress) =>
  delegations.find(
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
  const { source, input, node } = watch()
  const amount = input && !isNaN(input) ? toAmount(input) : undefined
  /* tx */
  const createTx = useCallback(
    ({ input, source, node }: TxValues) => {
      if (!address) return

      const amount = toAmount(input)
      const coin = new Coin("umis", amount)

      if (tab === StakeAction.REDELEGATE) {
        if (!source) return
        const msg = new MsgBeginRedelegate(address, destination, source, coin)
        return { msgs: [msg] }
      }
      if(tab === StakeAction.DELEGATE && node){
        const msg = new MsgBeginRedelegate(address, node, destination, coin)
        return { msgs: [msg] }
      }
      if (tab === StakeAction.REINVEST) {
        if (!source || !rewards) return
        const msg0 = new MsgWithdrawDelegatorReward(address, destination)
        const { byValidator } = calcRewardsValues(rewards, currency, calcValue)
        const values = byValidator.find(
          ({ address }) => address === destination
        )
        if (!values) return { code: -1, message: "No Reword", msgs: [] }
        const msg1 = new MsgDelegate(
          address,
          destination,
          new Coin("umis", formatNumber(values.sum, { integer: true }))
        )

        return { msgs: [msg0, msg1] }
      }

      const msgs = {
        [StakeAction.DELEGATE]: [new MsgDelegate(address, destination, coin)],
        [StakeAction.UNBOND]: [new MsgUndelegate(address, destination, coin)],
      }[tab]

      return { msgs }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [address, destination, tab, rewards]
  )

  /* fee */
  const balance = {
    [StakeAction.DELEGATE]: checkState ? (node && findDelegation(node)?.balance.amount.toString()) ?? "0" : getAmount(bankBalance, "umis"),
    [StakeAction.REDELEGATE]: 
      findCurrentNode(destination)?.balance.amount.toString() ?? "0",
    [StakeAction.UNBOND]:
      findDelegation(destination)?.balance.amount.toString() ?? "0",
    [StakeAction.REINVEST]: getAmount(bankBalance, "umis"),
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
      if (tab === StakeAction.REINVEST) {
        return
      }
      setValue("input", input)
      await trigger("input")
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setValue, trigger]
  )
  const token = tab === StakeAction.DELEGATE ? "umis" : ""
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
    tabType: tab,
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
              [StakeAction.REINVEST]: (
                <Grid gap={4}>
                  <FormWarning>
                    {t(
                      "all rewards on this validator will be withdraw, and delegate to it"
                    )}
                  </FormWarning>
                </Grid>
              ),
            }[tab]
          }

          {tab === StakeAction.REDELEGATE && (
            <FormItem label={t("To")}>
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
          {tab === StakeAction.DELEGATE && (<FormItem
            label='From'
            extra={
              <div className="delegate-switch">
                <span className="switch-wallet">Wallet</span>
                <Switch
                  checked={checkState}
                  onChange={(_: ChangeEvent<HTMLInputElement>, checked: boolean) => setCheckState(checked)} />
                <span className="switch-node">Node</span>
              </div>
            }>
            {checkState && <Select
              {...register("node", {
                required:
                  tab === StakeAction.DELEGATE
                    ? "Source node is required"
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
            </Select>}
          </FormItem>
          )}
          {((tab === StakeAction.DELEGATE) ||
            tab === StakeAction.UNBOND ||
            tab === StakeAction.REDELEGATE) && (
              <FormItem
                label={t("Amount")}
                extra={max.render()}
                error={errors.input?.message}
              >
                <Input
                  {...register("input", {
                    // valueAsNumber: true,
                    validate: validate.input(toInput(max.amount)),
                  })}
                  token="umis"
                  onFocus={max.reset}
                  inputMode="decimal"
                  placeholder={getPlaceholder()}
                  autoFocus
                />
              </FormItem>
            )}

          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default StakeForm
