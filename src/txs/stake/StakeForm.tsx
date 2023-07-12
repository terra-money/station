import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import {
  AccAddress,
  Coin,
  MsgAllianceDelegate,
  MsgAllianceRedelegate,
  MsgAllianceUndelegate,
  ValAddress,
} from "@terra-money/feather.js"
import { Delegation, Validator } from "@terra-money/feather.js"
import { MsgDelegate, MsgUndelegate } from "@terra-money/feather.js"
import { MsgBeginRedelegate } from "@terra-money/feather.js"
import { toAmount } from "@terra-money/terra-utils"
import { getAmount } from "utils/coin"
import { queryKey } from "data/query"
import { useNetwork } from "data/wallet"
import { getFindMoniker } from "data/queries/staking"
import { Grid } from "components/layout"
import {
  Form,
  FormHelp,
  FormItem,
  FormWarning,
  Input,
  Select,
} from "components/form"
import { getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Tx from "txs/Tx"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { useNativeDenoms } from "data/token"
import { AllianceDelegationResponse } from "@terra-money/feather.js/dist/client/lcd/api/AllianceAPI"
import styles from "./StakeTx.module.scss"

interface TxValues {
  source?: ValAddress
  input?: number
}
export enum StakeAction {
  DELEGATE = "Delegate",
  REDELEGATE = "Redelegate",
  UNBOND = "Undelegate",
}

interface Props {
  tab: StakeAction
  destination: ValAddress
  balances: { denom: string; amount: string }[]
  validators: Validator[]
  chainID: string
  denom: string
  details:
    | {
        isAlliance: false
        delegations: Delegation[]
      }
    | {
        isAlliance: true
        delegations: AllianceDelegationResponse[]
      }
}

const StakeForm = (props: Props) => {
  const {
    tab,
    destination,
    balances,
    validators,
    chainID,
    denom,
    details: { isAlliance, delegations },
  } = props

  const { t } = useTranslation()
  const readNativeDenom = useNativeDenoms()
  const addresses = useInterchainAddresses()
  const address = addresses?.[chainID]
  const networks = useNetwork()
  const findMoniker = getFindMoniker(validators)

  const delegationsOptions = isAlliance
    ? (delegations as AllianceDelegationResponse[]).filter(
        ({ delegation: { validator_address } }) =>
          tab !== StakeAction.REDELEGATE || validator_address !== destination
      )
    : (delegations as Delegation[]).filter(
        ({ validator_address }) =>
          tab !== StakeAction.REDELEGATE || validator_address !== destination
      )

  const defaultSource = isAlliance
    ? (delegationsOptions as AllianceDelegationResponse[])[0]?.delegation
        .validator_address
    : (delegationsOptions as Delegation[])[0]?.validator_address

  const findDelegation = (address: AccAddress) =>
    isAlliance
      ? (delegationsOptions as AllianceDelegationResponse[]).find(
          ({ delegation: { validator_address } }) =>
            validator_address === address
        )
      : (delegationsOptions as Delegation[]).find(
          ({ validator_address }) => validator_address === address
        )

  /* tx context */
  const initialGasDenom = networks[chainID].baseAsset

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
      const coin = new Coin(denom, amount)

      if (tab === StakeAction.REDELEGATE) {
        if (!source) return
        const msg = isAlliance
          ? new MsgAllianceRedelegate(address, source, destination, coin)
          : new MsgBeginRedelegate(address, source, destination, coin)
        return { msgs: [msg], chainID }
      }

      const msgs = {
        [StakeAction.DELEGATE]: [
          isAlliance
            ? new MsgAllianceDelegate(address, destination, coin)
            : new MsgDelegate(address, destination, coin),
        ],
        [StakeAction.UNBOND]: [
          isAlliance
            ? new MsgAllianceUndelegate(address, destination, coin)
            : new MsgUndelegate(address, destination, coin),
        ],
      }[tab]

      return { msgs, chainID }
    },
    [address, destination, tab, denom, chainID, isAlliance]
  )

  /* fee */
  const balance = {
    [StakeAction.DELEGATE]: getAmount(balances, denom),
    [StakeAction.REDELEGATE]:
      (source && findDelegation(source)?.balance.amount.toString()) ?? "0",
    [StakeAction.UNBOND]:
      findDelegation(destination)?.balance.amount.toString() ?? "0",
  }[tab]

  const estimationTxValues = useMemo(() => {
    return {
      input: toInput(2),
      // to check redelegation stacks
      source: tab === StakeAction.REDELEGATE ? source : undefined,
    }
  }, [source, tab])

  const onChangeMax = useCallback(
    async (input: number) => {
      setValue("input", input)
      await trigger("input")
    },
    [setValue, trigger]
  )

  const token = tab === StakeAction.DELEGATE ? denom : ""
  const tx = {
    decimals: readNativeDenom(token)?.decimals,
    token,
    amount,
    balance,
    initialGasDenom,
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

  const { symbol: feeTokenSymbol } = readNativeDenom(
    networks[chainID].baseAsset
  )
  const { symbol } = readNativeDenom(denom)

  return (
    <Tx {...tx}>
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          {
            {
              [StakeAction.DELEGATE]: (
                <FormWarning>
                  {t("Leave coins to pay fees for subsequent transactions")}
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
                      "A maximum 7 undelegations can be in progress at the same time"
                    )}
                  </FormWarning>
                  <FormWarning>
                    {t(
                      "No rewards are distributed during the 21 day undelegation period"
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
                {isAlliance
                  ? (delegationsOptions as AllianceDelegationResponse[])
                      ?.filter(
                        ({ delegation: { validator_address } }) =>
                          validator_address !== destination
                      )
                      .map(({ delegation: { validator_address } }) => (
                        <option
                          value={validator_address}
                          key={validator_address}
                        >
                          {findMoniker(validator_address)}
                        </option>
                      ))
                  : (delegationsOptions as Delegation[])
                      ?.filter(
                        ({ validator_address }) =>
                          validator_address !== destination
                      )
                      .map(({ validator_address }) => (
                        <option
                          value={validator_address}
                          key={validator_address}
                        >
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
              token={denom}
              onFocus={max.reset}
              inputMode="decimal"
              placeholder={getPlaceholder()}
              autoFocus
            />
          </FormItem>

          {isAlliance && tab === StakeAction.DELEGATE && (
            <FormHelp>
              <section className={styles.alliance__info}>
                {feeTokenSymbol} is needed to stake on {networks[chainID].name}:
                <ul>
                  <li>
                    {feeTokenSymbol} is the fee token used on the{" "}
                    {networks[chainID].name} blockchain
                  </li>
                  <li>
                    To stake {symbol} on {networks[chainID].name}, visit the
                    Swap page and swap any token for {feeTokenSymbol}
                  </li>
                  <li>
                    Send {feeTokenSymbol} from Terra to {networks[chainID].name}{" "}
                    by clicking 'Send' on your wallet sidebar and selecting your{" "}
                    {networks[chainID].name} address from your address book
                  </li>
                  <li>
                    Return to the Stake page to stake your {symbol} once you
                    have {feeTokenSymbol} on {networks[chainID].name}
                  </li>
                </ul>
              </section>
            </FormHelp>
          )}

          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default StakeForm
