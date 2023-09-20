import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { Coin } from "@terra-money/feather.js"
import { toAmount } from "@terra-money/terra-utils"
import { getAmount } from "utils/coin"
import { ExternalLink } from "components/general"
import { combineState, queryKey } from "data/query"
import { useNetwork } from "data/wallet"
import { Flex, FlexColumn, Grid, Page } from "components/layout"
import { Form, FormHelp, FormItem, FormWarning, Input } from "components/form"
import { getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Tx from "../Tx"
import { useNativeDenoms, DEFAULT_NATIVE_DECIMALS } from "data/token"
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
import styles from "./QuickStakeForm.module.scss"
import { useAllianceDelegations } from "data/queries/alliance"
import { useAllianceHub } from "data/queries/alliance-protocol"
import BigNumber from "bignumber.js"
import { QuickStakeAction } from "pages/stake/hooks/useQuickStake"

interface TxValues {
  input: number
}

interface Props {
  action: string
  balances: { denom: string; amount: string }[]
  chainID: string
  denom: string
  unbondingTime: number
  isAlliance: boolean
  stakeOnAllianceHub?: boolean
}

const QuickStakeForm = (props: Props) => {
  const {
    action,
    balances,
    chainID,
    denom,
    unbondingTime,
    isAlliance,
    stakeOnAllianceHub,
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
  const allianceHub = useAllianceHub()
  const { data: allianceHubDelegations, ...allianceHubDelegationsState } =
    allianceHub.useDelegations()
  const filteredHubDelegationsByChainID =
    chainID !== undefined
      ? allianceHubDelegations?.filter((del) => del.chainID === chainID)
      : allianceHubDelegations

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
    allianceDelegationsState,
    allianceHubDelegationsState
  )
  const allianceHubContract = allianceHub.useHubAddress()

  /* form */
  const form = useForm<TxValues>({
    mode: "onChange",
  })

  const { register, trigger, watch, setValue, handleSubmit, formState } = form
  const { errors } = formState
  const { input } = watch()
  const { decimals } = readNativeDenom(denom)

  const amount = toAmount(
    input,
    decimals ? { decimals } : { decimals: DEFAULT_NATIVE_DECIMALS }
  )

  const daysToUnbond = getChainUnbondTime(stakeParams?.unbonding_time)

  const elegibleVals = useMemo(() => {
    if (!validators) return
    return shuffle(getPriorityVals(validators))
  }, [validators])

  const stakeMsgs = useMemo(() => {
    if (!address || !elegibleVals) return
    const { decimals } = readNativeDenom(denom)
    const coin = new Coin(
      denom,
      toAmount(
        input || toInput(1),
        decimals ? { decimals } : { decimals: DEFAULT_NATIVE_DECIMALS }
      )
    )

    return getQuickStakeMsgs(
      address,
      coin,
      elegibleVals,
      decimals,
      isAlliance,
      allianceHubContract,
      stakeOnAllianceHub
    )
  }, [
    address,
    elegibleVals,
    denom,
    input,
    isAlliance,
    readNativeDenom,
    allianceHubContract,
    stakeOnAllianceHub,
  ])

  const unstakeMsgs = useMemo(() => {
    if (!address || !(isAlliance ? allianceDelegations : delegations)) return
    const { decimals } = readNativeDenom(denom)
    const coin = new Coin(
      denom,
      toAmount(
        input || toInput(1),
        decimals ? { decimals } : { decimals: DEFAULT_NATIVE_DECIMALS }
      )
    )
    return getQuickUnstakeMsgs(
      address,
      coin,
      {
        isAlliance,
        // @ts-expect-error
        delegations: isAlliance ? allianceDelegations : delegations,
      },
      allianceHubContract,
      stakeOnAllianceHub
    )
  }, [
    address,
    denom,
    input,
    delegations,
    isAlliance,
    allianceDelegations,
    allianceHubContract,
    stakeOnAllianceHub,
    readNativeDenom,
  ])

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

  const calculateUnbondBalance = () => {
    if (isAlliance && stakeOnAllianceHub && filteredHubDelegationsByChainID) {
      let amount = new BigNumber(0)

      for (const hubDel of filteredHubDelegationsByChainID) {
        for (const del of hubDel.delegations) {
          if (del.delegation.denom === denom) {
            amount = amount.plus(del.balance.amount.toString())
          }
        }
      }

      return amount.toString()
    } else if (isAlliance && allianceDelegations) {
      return calcDelegationsTotal(allianceDelegations)
    } else {
      return calcDelegationsTotal(delegations)
    }
  }

  /* fee */
  const balance = {
    [QuickStakeAction.DELEGATE]: getAmount(balances, denom), // TODO flexible denom
    [QuickStakeAction.UNBOND]: calculateUnbondBalance(),
  }[action]

  const estimationTxValues = useMemo(() => ({ input: toInput(0) }), [])

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
    decimals: asset.decimals,
    token,
    amount,
    balance,
    estimationTxValues,
    createTx,
    onChangeMax,
    queryKeys: [
      queryKey.allianceProtocol.hubPendingRewards,
      queryKey.allianceProtocol.hubStakedBalances,
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
                    validate: validate.input(
                      toInput(
                        max.amount,
                        decimals ? decimals : DEFAULT_NATIVE_DECIMALS
                      ),
                      decimals ? decimals : DEFAULT_NATIVE_DECIMALS
                    ),
                  })}
                  type="number"
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
                        {network[chainID].name} blockchain.
                      </li>
                      <li>
                        To stake {asset.symbol} on {network[chainID].name},
                        visit{" "}
                        <ExternalLink href="https://tfm.com/ibc">
                          https://tfm.com/ibc
                        </ExternalLink>{" "}
                        and swap any token for {feeTokenSymbol} on{" "}
                        {network[chainID].name}. Make sure the {feeTokenSymbol}{" "}
                        is being sent to your {network[chainID].name} wallet on
                        Station.
                      </li>
                      <li>
                        Send {feeTokenSymbol} to {network[chainID].name} by
                        clicking 'Send' on your wallet sidebar and selecting
                        your {network[chainID].name} address from your address
                        book
                      </li>
                      <li>
                        Return to Station's Stake page to stake your{" "}
                        {asset.symbol} on {network[chainID].name}.
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
                      {!stakeOnAllianceHub && (
                        <FormWarning>
                          {t(
                            "Undelegating funds do not accrue rewards and are locked for {{daysToUnbond}} days",
                            { daysToUnbond }
                          )}
                        </FormWarning>
                      )}
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

export default QuickStakeForm
