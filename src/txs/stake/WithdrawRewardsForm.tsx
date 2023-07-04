import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import BigNumber from "bignumber.js"
import { MsgExecuteContract, ValAddress } from "@terra-money/feather.js"
import { Rewards } from "@terra-money/feather.js"
import { MsgWithdrawDelegatorReward } from "@terra-money/feather.js"
import { queryKey } from "data/query"
import { useCurrency } from "data/settings/Currency"
import { useNetwork } from "data/wallet"
import { useMemoizedCalcValue } from "data/queries/coingecko"
import { calcRewardsValues } from "data/queries/distribution"
import { WithTokenItem } from "data/token"
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

interface Props {
  rewards: Rewards
  chain: string
}

const WithdrawRewardsForm = ({ rewards, chain }: Props) => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const allianceHub = useAllianceHub()
  const allianceHubAddress = allianceHub.useHubAddress()
  const addresses = useInterchainAddresses()
  const address = addresses && addresses[chain]
  const calcValue = useMemoizedCalcValue()
  const { byValidator } = useMemo(
    () =>
      calcRewardsValues(rewards, currency.id, (coin) => Number(coin.amount)),
    [rewards, currency]
  )
  const networks = useNetwork()

  /* tx context */
  const initialGasDenom = networks[chain].baseAsset

  /* select validators */
  const init = useCallback(
    (value = false) =>
      byValidator.reduce(
        (acc, { address }) => ({ ...acc, [address]: value }),
        {}
      ),
    [byValidator]
  )
  const [state, setState] = useState<Record<ValAddress, boolean>>(init(true))

  useEffect(() => {
    setState(init(true))
  }, [init])

  const selectable = byValidator.length >= 1
  const selected = useMemo(
    () => Object.keys(state).filter((address) => state[address]),
    [state]
  )

  /* calc */
  const selectedTotal = selected.reduce<Record<Denom, Amount>>(
    (prev, address) => {
      const item = byValidator.find((i) => i.address === address)

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
      if (selection.startsWith("terravaloper")) {
        let msg = new MsgWithdrawDelegatorReward(address, selection)
        msgs.push(msg)
      } else {
        // Since each selection is a unique address with multiple coins
        // we don't need to worry about duplicate coins.
        for (const coin of rewards.rewards[selection].toArray()) {
          let msg = new MsgExecuteContract(address, allianceHubAddress, {
            claim_rewards: {
              native: coin.denom,
            },
          })

          msgs.push(msg)
        }
      }
    }

    return { msgs, chainID: chain }
  }, [address, selected, chain, allianceHubAddress, rewards])

  /* fee */
  const estimationTxValues = useMemo(() => ({}), [])

  const tx = {
    initialGasDenom,
    estimationTxValues,
    createTx,
    querykeys: [queryKey.distribution.rewards],
    chain,
    onSuccess: () => reset(),
  }

  if (!selectable) {
    return <Empty>{t("No rewards on selected chain")}</Empty>
  }

  return (
    <Tx {...tx}>
      {({ fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <Grid gap={12}>
            <Flex className={styles.actions} start>
              {Object.values(state).some((state) => !state) ? (
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => setState(init(true))}
                >
                  {t("Select All")}
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => setState(init(false))}
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
                {byValidator.map(({ address, list: [{ denom, amount }] }) => {
                  const checked = state[address]
                  return (
                    <Checkbox
                      className={styles.checkbox}
                      checked={checked}
                      onChange={() =>
                        setState({ ...state, [address]: !checked })
                      }
                      key={address}
                    >
                      <dl className={styles.item}>
                        <dt>
                          {address === allianceHubAddress ? (
                            <FinderLink value={address}>
                              Alliance Hub
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
                })}
              </section>
            </Card>
            {selected.length ? <FormArrow /> : undefined}
            <FormItem>
              <TokenCardGrid maxHeight>
                {Object.entries(selectedTotal).map(([denom, amount]) => (
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
