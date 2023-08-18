import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import BigNumber from "bignumber.js"
import { MsgExecuteContract } from "@terra-money/feather.js"
import { Rewards } from "@terra-money/feather.js"
import { MsgWithdrawDelegatorReward } from "@terra-money/feather.js"
import { queryKey } from "data/query"
import { useCurrency } from "data/settings/Currency"
import { useNetwork } from "data/wallet"
import { useMemoizedCalcValue } from "data/queries/coingecko"
import { calcRewardsValues } from "data/queries/distribution"
import { WithTokenItem, useNativeDenoms } from "data/token"
import { FinderLink, ValidatorLink } from "components/general"
import { Form, FormArrow, FormItem, Checkbox } from "components/form"
import { Card, Flex, Grid } from "components/layout"
import { TokenCard, TokenCardGrid } from "components/token"
import { Empty } from "components/feedback"
import styles from "./WithdrawRewardsForm.module.scss"
import Tx from "txs/Tx"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { Read } from "components/token"
import { useAllianceHub } from "data/queries/alliance-protocol"
import { AHAllRewards } from "data/types/alliance-protocol"
import { parseRewards } from "data/parsers/alliance-protocol"

interface Props {
  rewards: Rewards
  ahRewards: AHAllRewards
  chain: string
}

const WithdrawRewardsForm = ({ rewards, chain, ahRewards }: Props) => {
  const { t } = useTranslation()
  const readNativeDenom = useNativeDenoms()
  const currency = useCurrency()
  const allianceHub = useAllianceHub()
  const allianceHubAddress = allianceHub.useHubAddress()
  const addresses = useInterchainAddresses()
  const address = addresses && (addresses[chain] as string)
  const calcValue = useMemoizedCalcValue()
  const networks = useNetwork()
  const listing = useMemo(() => {
    const { byValidator: stByVal, total: stTotalByVal } = calcRewardsValues(
      rewards,
      currency.id,
      (coin) => Number(coin.amount)
    )

    if (chain !== "pisco-1" && chain !== "phoenix-1") {
      return {
        byValidator: stByVal,
        total: stTotalByVal,
      }
    }

    const { byValidator: stByAllyVal, total: stTotalByAlly } = parseRewards(
      ahRewards,
      allianceHubAddress
    )

    return {
      byValidator: stByVal.concat(stByAllyVal),
      total: {
        list: stTotalByVal.list.concat(stTotalByAlly.list),
        total: new BigNumber(stTotalByAlly.sum)
          .plus(new BigNumber(stTotalByAlly.sum))
          .toString(),
      },
    }
  }, [rewards, ahRewards, currency, allianceHubAddress, chain])

  /* select validators */
  const overwritteSelectionsAs = useCallback(
    (value = false): Array<boolean> => {
      const totalValidators = listing.byValidator.length

      return new Array(totalValidators).fill(value, 0, totalValidators)
    },
    [listing.byValidator]
  )

  // Each number represents the index of the validator in the list
  // the boolean represents whether the validator is selected or not
  const [state, setState] = useState<Record<number, boolean>>(
    overwritteSelectionsAs(true)
  )

  useEffect(() => {
    if (chain) {
      setState(overwritteSelectionsAs(true))
    }
  }, [chain, overwritteSelectionsAs])

  const selected = useMemo(
    () => Object.keys(state).filter((address) => state[Number(address)]),
    [state]
  )

  /* calc */
  const selectedTotal = selected.reduce<Record<Denom, Amount>>(
    (prev, index) => {
      const item = listing.byValidator[Number(index)]
      if (!item) return prev

      return {
        ...prev,
        ...item.list.reduce(
          (acc, { amount, denom }) => ({
            ...acc,
            [denom]: new BigNumber(amount)
              .plus(prev[denom] ?? 0)
              .integerValue(BigNumber.ROUND_FLOOR)
              .toString(),
          }),
          {}
        ),
      }
    },
    {}
  )

  /* form */
  const { handleSubmit, reset } = useForm({ mode: "onChange" })

  /* tx */
  const createTx = useCallback(() => {
    if (!address) return

    const msgs: Array<MsgWithdrawDelegatorReward | MsgExecuteContract> = []
    for (const selection of selected) {
      const reward = listing.byValidator[Number(selection)]
      if (!reward) return

      // AllianceHub delegations are differenciated by the stakedAsset field
      // because the smart contract needs to know the staked asset to claim the rewards
      let msg =
        reward?.stakedAsset !== undefined
          ? new MsgExecuteContract(address, reward.address, {
              claim_rewards: { native: reward.stakedAsset },
            })
          : new MsgWithdrawDelegatorReward(address, reward.address)

      msgs.push(msg)
    }

    return { msgs, chainID: chain }
  }, [address, selected, chain, listing.byValidator])

  /* fee */
  const estimationTxValues = useMemo(() => ({}), [])

  const tx = {
    overwritteSelectionsAsialGasDenom: networks[chain].baseAsset,
    estimationTxValues,
    createTx,
    querykeys: [queryKey.distribution.rewards],
    chain,
    onSuccess: () => reset(),
  }

  if (!listing.byValidator?.length) {
    return <Empty>{t("No rewards on selected chain")}</Empty>
  }

  return (
    <Tx {...tx}>
      {({ fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <Grid gap={12}>
            <Flex className={styles.actions} start>
              {Object.values(state ?? {}).some((state) => !state) ? (
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => setState(overwritteSelectionsAs(true))}
                >
                  {t("Select All")}
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => setState(overwritteSelectionsAs(false))}
                >
                  {t("Deselect All")}
                </button>
              )}
            </Flex>
            <Card size="small" className={styles.card}>
              <dl className={styles.title}>
                <dt>{t("Validators")}</dt>
                <dd>{t("Rewards")}</dd>
              </dl>
              <section className={styles.validators}>
                {listing.byValidator.map(
                  (
                    { address, stakedAsset, list: [{ denom, amount }] },
                    index
                  ) => {
                    const checked = state[index]
                    const { symbol } = readNativeDenom(stakedAsset ?? "")

                    return (
                      <Checkbox
                        className={styles.checkbox}
                        checked={checked}
                        onChange={() =>
                          setState({ ...state, [index]: !checked })
                        }
                        key={index}
                      >
                        <dl className={styles.item}>
                          <dt>
                            {address === allianceHubAddress ? (
                              <FinderLink
                                value={address}
                                style={{ fontSize: "12px" }}
                              >
                                Alliance Hub ({symbol})
                              </FinderLink>
                            ) : (
                              <ValidatorLink address={address} />
                            )}
                          </dt>
                          <dd>
                            <Read amount={amount} denom={denom} />
                          </dd>
                        </dl>
                      </Checkbox>
                    )
                  }
                )}
              </section>
            </Card>
            {selected.length ? <FormArrow /> : undefined}
            <FormItem>
              <TokenCardGrid maxHeight>
                {Object.entries(selectedTotal ?? {}).map(([denom, amount]) => (
                  <WithTokenItem token={denom} key={denom}>
                    {(item) => (
                      <TokenCard
                        {...item}
                        name=""
                        value={calcValue({ amount, denom })}
                        amount={amount}
                      />
                    )}
                  </WithTokenItem>
                ))}
              </TokenCardGrid>
            </FormItem>
          </Grid>
          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default WithdrawRewardsForm
