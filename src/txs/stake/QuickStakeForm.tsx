import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { Coin } from "@terra-money/feather.js"
import { readPercent, toAmount } from "@terra-money/terra-utils"
import { getAmount } from "utils/coin"
import { combineState, queryKey } from "data/query"
import { useNetwork } from "data/wallet"
import { Flex, FlexColumn, Grid, Page } from "components/layout"
import { Form, FormHelp, FormItem, FormWarning, Input } from "components/form"
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
import { memo } from "react"
import styles from "./QuickStakeForm.module.scss"
import { useAllianceDelegations } from "data/queries/alliance"

interface TxValues {
  input?: number
}

interface Props {
  action: string
  balances: { denom: string; amount: string }[]
  chainID: string
  denom: string
  rewardRate: number
  unbondingTime: number
  isAlliance: boolean
}

const QuickStakeForm = (props: Props) => {
  const {
    action,
    balances,
    chainID,
    denom,
    rewardRate,
    unbondingTime,
    isAlliance,
  } = props

  const { t } = useTranslation()
  const addresses = useInterchainAddresses()
  const address = addresses?.[chainID]
  const network = useNetwork()
  const { data: validators, ...validatorState } = useValidators(chainID)
  const { data: delegations, ...delegationsState } = useDelegations(
    chainID,
    isAlliance || action === QuickStakeAction.DELEGATE
  )
  const { data: allianceDelegations, ...allianceDelegationsState } =
    useAllianceDelegations(
      chainID,
      !isAlliance || action === QuickStakeAction.DELEGATE
    )
  const readNativeDenom = useNativeDenoms()
  const { data: stakeParams, ...stakeState } = useStakingParams(chainID)
  const state = combineState(
    validatorState,
    delegationsState,
    stakeState,
    allianceDelegationsState
  )

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
    const coin = new Coin(denom, toAmount(input || toInput(1)))
    const { decimals } = readNativeDenom(denom)
    return getQuickStakeMsgs(address, coin, elegibleVals, decimals, isAlliance)
  }, [address, elegibleVals, denom, input, isAlliance, readNativeDenom])

  const unstakeMsgs = useMemo(() => {
    if (!address || !(isAlliance ? allianceDelegations : delegations)) return
    const coin = new Coin(denom, toAmount(input || toInput(1)))
    return getQuickUnstakeMsgs(address, coin, {
      isAlliance,
      // @ts-expect-error
      delegations: isAlliance ? allianceDelegations : delegations,
    })
  }, [address, denom, input, delegations, isAlliance, allianceDelegations])

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
    [QuickStakeAction.DELEGATE]: getAmount(balances, denom), // TODO flexible denom
    [QuickStakeAction.UNBOND]: calcDelegationsTotal(
      (isAlliance ? allianceDelegations : delegations) ?? []
    ),
  }[action]

  const estimationTxValues = useMemo(() => ({ input: toInput(1) }), [])

  const onChangeMax = useCallback(
    async (input: number) => {
      setValue("input", input)
      await trigger("input")
    },
    [setValue, trigger]
  )

  const asset = readNativeDenom(denom)
  const feeTokenSymbol = readNativeDenom(network[chainID].baseAsset).symbol

  const token = action === QuickStakeAction.DELEGATE ? denom : ""
  const tx = {
    decimals: readNativeDenom(token)?.decimals,
    token,
    amount,
    balance,
    estimationTxValues,
    createTx,
    onChangeMax,
    queryKeys: [
      queryKey.staking.delegations,
      queryKey.alliance.delegations,
      queryKey.staking.unbondings,
      queryKey.distribution.rewards,
      queryKey.bank.balances,
    ],
    chain: chainID,
  }

  return (
    <Page invisible {...state}>
      <Tx {...tx}>
        {({ max, fee, submit }) => (
          <section>
            <FlexColumn gap={18} className={styles.token__details}>
              <Flex gap={4} start>
                <div className={styles.token__icon__container}>
                  {asset && (
                    <img
                      src={asset.icon}
                      alt={asset.symbol}
                      className={styles.token__icon}
                    />
                  )}
                  {network && (
                    <img
                      src={network[chainID].icon}
                      alt={network[chainID].name}
                      className={styles.chain__icon}
                    />
                  )}
                </div>
                {asset.name ?? asset.symbol}
                <span className={styles.token__chain}>
                  {network[chainID]?.name}
                </span>
              </Flex>
              <dl>
                <dt>{t("Unbonding period")}:</dt>
                <dd>{t("{{value}} days", { value: unbondingTime })}</dd>
              </dl>
              <dl>
                <dt>{t("Rewards rate")}:</dt>
                <dd>{readPercent(rewardRate)}</dd>
              </dl>
            </FlexColumn>
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
                  token={denom}
                  onFocus={max.reset}
                  inputMode="decimal"
                  placeholder={getPlaceholder()}
                  autoFocus
                />
              </FormItem>

              {isAlliance && action === QuickStakeAction.DELEGATE && (
                <FormHelp>
                  <section className={styles.alliance__info}>
                    {feeTokenSymbol} is needed to stake on{" "}
                    {network[chainID].name}:
                    <ul>
                      <li>
                        {feeTokenSymbol} is the fee token used on the{" "}
                        {network[chainID].name} blockchain
                      </li>
                      <li>
                        To stake {asset.symbol} on {network[chainID].name},
                        visit the Swap page and swap any token for{" "}
                        {feeTokenSymbol}
                      </li>
                      <li>
                        Send {feeTokenSymbol} from Terra to{" "}
                        {network[chainID].name} by clicking 'Send' on your
                        wallet sidebar and selecting your{" "}
                        {network[chainID].name} address from your address book
                      </li>
                      <li>
                        Return to the Stake page to stake your {asset.symbol}{" "}
                        once you have {feeTokenSymbol} on{" "}
                        {network[chainID].name}
                      </li>
                    </ul>
                  </section>
                </FormHelp>
              )}

              {fee.render()}

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

              {submit.button}
            </Form>
          </section>
        )}
      </Tx>
    </Page>
  )
}

export default memo(QuickStakeForm)
