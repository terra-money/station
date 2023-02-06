import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import BigNumber from "bignumber.js"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import { Validator, ValAddress } from "@terra-money/feather.js"
import { Rewards } from "@terra-money/feather.js"
import { MsgWithdrawDelegatorReward } from "@terra-money/feather.js"
import { queryKey } from "data/query"
import { useCurrency } from "data/settings/Currency"
import { useNetwork } from "data/wallet"
import { useMemoizedCalcValue } from "data/queries/coingecko"
import { getFindMoniker } from "data/queries/staking"
import { calcRewardsValues } from "data/queries/distribution"
import { WithTokenItem } from "data/token"
import { ValidatorLink } from "components/general"
import { Form, FormArrow, FormItem, Checkbox } from "components/form"
import { Card, Flex, Grid } from "components/layout"
import { TokenCard, TokenCardGrid } from "components/token"
import styles from "./WithdrawRewardsForm.module.scss"
import Tx from "txs/Tx"
import { useInterchainAddresses } from "auth/hooks/useAddress"

interface Props {
  rewards: Rewards
  validators: Validator[]
  chain: string
}

const WithdrawRewardsForm = ({ rewards, validators, chain }: Props) => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const addresses = useInterchainAddresses()
  const address = addresses && addresses[chain]
  const calcValue = useMemoizedCalcValue()
  const findMoniker = getFindMoniker(validators)
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

  const selectable = byValidator.length > 1
  const selected = useMemo(
    () => Object.keys(state).filter((address) => state[address]),
    [state]
  )

  const [isOpen, setIsOpen] = useState(true)
  const toggle = () => setIsOpen(!isOpen)

  /* calc */
  const selectedTotal = selected.reduce<Record<Denom, Amount>>(
    (prev, address) => {
      const item = byValidator.find((item) => item.address === address)

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

  const selectedValidatorsText = !selected.length
    ? t("Not selected")
    : selected.length === 1
    ? findMoniker(selected[0])
    : t("{{moniker}} and {{length}} others", {
        moniker: findMoniker(selected[0]),
        length: selected.length - 1,
      })

  /* form */
  const { handleSubmit } = useForm({ mode: "onChange" })

  /* tx */
  const createTx = useCallback(() => {
    if (!address) return

    const msgs = selected.map((operatorAddress) => {
      return new MsgWithdrawDelegatorReward(address, operatorAddress)
    })

    return { msgs, chainID: chain }
  }, [address, selected, chain])

  /* fee */
  const estimationTxValues = useMemo(() => ({}), [])

  const tx = {
    initialGasDenom,
    estimationTxValues,
    createTx,
    querykeys: [queryKey.distribution.rewards],
    chain,
  }

  return (
    <Tx {...tx}>
      {({ fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <Grid gap={12}>
            <dl>
              <dt>{t("Validators")}</dt>
              <dd>
                {selectable ? (
                  <button type="button" onClick={toggle}>
                    {selectedValidatorsText}
                    {isOpen ? (
                      <ExpandLessIcon style={{ fontSize: 16 }} />
                    ) : (
                      <ExpandMoreIcon style={{ fontSize: 16 }} />
                    )}
                  </button>
                ) : (
                  selectedValidatorsText
                )}
              </dd>
            </dl>

            {selectable && isOpen && (
              <Card size="small" className={styles.card}>
                <Flex className={styles.actions} start>
                  {Object.values(state).some((state) => !state) ? (
                    <button
                      type="button"
                      className={styles.button}
                      onClick={() => setState(init(true))}
                    >
                      {t("Select all")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.button}
                      onClick={() => setState(init(false))}
                    >
                      {t("Deselect all")}
                    </button>
                  )}
                </Flex>

                <section className={styles.validators}>
                  {byValidator.map(({ address, sum }) => {
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
                        <div className={styles.item}>
                          <ValidatorLink address={address} />
                        </div>
                      </Checkbox>
                    )
                  })}
                </section>
              </Card>
            )}

            <FormArrow />

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
