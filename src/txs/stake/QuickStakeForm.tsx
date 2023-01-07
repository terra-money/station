import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { Coin } from "@terra-money/feather.js"
import { toAmount } from "@terra.kitchen/utils"
import { getAmount } from "utils/coin"
import { combineState, queryKey } from "data/query"
import { useNetwork } from "data/wallet"
import { Grid, Page } from "components/layout"
import { Form, FormItem, FormWarning, Input } from "components/form"
import { getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Tx from "../Tx"
import { useNativeDenoms } from "data/token"
import { QuickStakeAction } from "pages/stake/QuickStake"
import {
  getQuickStakeMsgs,
  getQuickUnstakeMsgs,
  getPriorityVals,
  useValidators,
  useDelegations,
  calcDelegationsTotal,
  useStakingParams,
  getChainUnbondTime,
} from "data/queries/staking"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import shuffle from "utils/shuffle"

interface TxValues {
  input?: number
}

interface Props {
  action: string
  balances: { denom: string; amount: string }[]
  chainID: string
}

const QuickStakeForm = (props: Props) => {
  const { action, balances, chainID } = props

  const { t } = useTranslation()
  const addresses = useInterchainAddresses()
  const address = addresses?.[chainID]
  const network = useNetwork()
  const { data: validators, ...validatorState } = useValidators(chainID)
  const { data: delegations, ...delegationsState } = useDelegations(chainID)
  const readNativeDenom = useNativeDenoms()
  const { data: stakeParams, ...stakeState } = useStakingParams(chainID)
  const state = combineState(validatorState, delegationsState, stakeState)

  const { baseAsset } = network[chainID]
  // const daysToUnbond = getChainUnbondTime(stakeParams)

  /* form */
  const form = useForm<TxValues>({
    mode: "onChange",
  })

  const { register, trigger, watch, setValue, handleSubmit, formState } = form
  const { errors } = formState
  const { input } = watch()
  const amount = toAmount(input)

  const daysToUnbond = useMemo(() => {
    if (!stakeParams) return
    return getChainUnbondTime(stakeParams)
  }, [stakeParams])

  const elegibleVals = useMemo(() => {
    if (!validators) return
    return shuffle(getPriorityVals(validators))
  }, [validators])

  const stakeMsgs = useMemo(() => {
    if (!address || !elegibleVals) return
    const coin = new Coin(baseAsset, toAmount(input || toInput(1)))
    const { decimals } = readNativeDenom(baseAsset)
    return getQuickStakeMsgs(address, coin, elegibleVals, decimals)
  }, [address, elegibleVals, baseAsset, input, readNativeDenom])

  const unstakeMsgs = useMemo(() => {
    if (!address || !delegations) return
    const coin = new Coin(baseAsset, toAmount(input || toInput(1)))
    return getQuickUnstakeMsgs(address, coin, delegations)
  }, [address, baseAsset, input, delegations])

  /* tx */
  const createTx = useCallback(
    ({ input }: TxValues) => {
      const msgs =
        action === QuickStakeAction.DELEGATE ? stakeMsgs : unstakeMsgs
      if (!msgs) return
      return { msgs, chainID }
    },
    [action, unstakeMsgs, stakeMsgs, chainID]
  )

  /* fee */
  const balance = {
    [QuickStakeAction.DELEGATE]: getAmount(balances, baseAsset), // TODO flexible denom
    [QuickStakeAction.UNBOND]: calcDelegationsTotal(delegations ?? []),
  }[action]

  const estimationTxValues = useMemo(() => ({ input: toInput(1) }), [])

  const onChangeMax = useCallback(
    async (input: number) => {
      setValue("input", input)
      await trigger("input")
    },
    [setValue, trigger]
  )

  const token = action === QuickStakeAction.DELEGATE ? baseAsset : ""

  const tx = {
    token,
    amount,
    balance,
    estimationTxValues,
    createTx,
    onChangeMax,
    queryKeys: [
      queryKey.staking.delegations,
      queryKey.staking.unbondings,
      queryKey.distribution.rewards,
    ],
    chain: chainID,
  }

  return (
    <Page invisible {...state}>
      <Tx {...tx}>
        {({ max, fee, submit }) => (
          <Form onSubmit={handleSubmit(submit.fn)}>
            {
              {
                [QuickStakeAction.DELEGATE]: (
                  <FormWarning>
                    {t(
                      "Leave enough coins to pay fee for subsequent transactions"
                    )}
                  </FormWarning>
                ),
                [QuickStakeAction.UNBOND]: (
                  <Grid gap={4}>
                    <FormWarning>
                      {t(
                        "A maximum 7 undelegations can be in progress at the same time"
                      )}
                    </FormWarning>
                    <FormWarning>
                      {t(
                        "Undelegating funds do not accrue rewards and are locked for {{daysToUnbond}} days",
                        { daysToUnbond }
                      )}
                    </FormWarning>
                  </Grid>
                ),
              }[action]
            }
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
                token={baseAsset}
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
    </Page>
  )
}

export default QuickStakeForm
