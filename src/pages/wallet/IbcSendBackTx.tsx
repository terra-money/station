import { AccAddress, Coin, MsgTransfer } from "@terra-money/feather.js"
import { toAmount } from "@terra-money/terra-utils"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { Form, FormItem, Input } from "components/form"
import { useBankBalance } from "data/queries/bank"
import { calculateIBCDenom, useIBCBaseDenom } from "data/queries/ibc"
import { queryKey } from "data/query"
import { useNativeDenoms } from "data/token"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import Tx from "txs/Tx"
import { CoinInput, getPlaceholder, toInput } from "txs/utils"
import validate from "txs/validate"
import styles from "./IbcSendBackTx.module.scss"
import { useNetwork } from "data/wallet"
import { FlexColumn } from "components/layout"
import { useThemeAnimation } from "data/settings/Theme"
import DoneAllIcon from "@mui/icons-material/DoneAll"
import { LinearProgress } from "@mui/material"
import { useInterchainLCDClient } from "data/queries/lcdClient"
import { useQueryClient } from "react-query"
import ReportIcon from "@mui/icons-material/Report"

interface Props {
  token: string
  chainID: string
}

interface TxValues {
  input?: number
}

function Steps({
  step,
  chains,
  isLoading,
}: {
  step: number
  chains: string[]
  isLoading: boolean
}) {
  const networks = useNetwork()

  return (
    <section className={styles.steps__container}>
      {chains.map((chain, i) => (
        <>
          {!!i && (
            <div
              key={`path-${i}`}
              className={
                i < step || (i === step && !isLoading)
                  ? styles.chain__path__active
                  : styles.chain__path
              }
            >
              {i === step && isLoading && (
                <LinearProgress
                  color="inherit"
                  className={styles.progress}
                  style={{ height: 8, borderRadius: 4 }}
                  //sx={{ position: "absolute" /* to overwrite */ }}
                />
              )}
            </div>
          )}
          <div
            key={`chain-${i}`}
            className={
              i < step || (i === step && !isLoading)
                ? styles.chain__pill__active
                : styles.chain__pill
            }
          >
            <img src={networks[chain]?.icon} alt={chain} />
          </div>
        </>
      ))}
    </section>
  )
}

function IbcSendBackTx({ token, chainID }: Props) {
  const balances = useBankBalance()
  const lcd = useInterchainLCDClient()
  const readNativeDenom = useNativeDenoms()
  const animation = useThemeAnimation()
  const { t } = useTranslation()
  const addresses = useInterchainAddresses()
  const { data: ibcDetails, ...state } = useIBCBaseDenom(token, chainID, true)
  const form = useForm<TxValues>({ mode: "onChange" })
  const { register, trigger, watch, setValue, handleSubmit, formState } = form
  const { errors } = formState
  const { input } = watch()
  const queryClient = useQueryClient()
  const networks = useNetwork()

  const [step, setStep] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [waitUntil, setWaitUntil] = useState<
    undefined | { chainID: string; denom: string; balance: number }
  >(undefined)

  async function getBalance(denom: string, chainID: string) {
    if (!addresses) return 0

    if (AccAddress.validate(denom)) {
      const { balance } = await lcd.wasm.contractQuery<{ balance: Amount }>(
        denom,
        { balance: { address: addresses[chainID] } }
      )

      return Number(balance ?? 0)
    } else {
      const [balances] = await lcd.bank.balance(addresses[chainID])

      const tokenBalance =
        balances.toData().find(({ denom: d }) => denom === d)?.amount ?? "0"

      return Number(tokenBalance)
    }
  }

  const isKujira = networks[ibcDetails?.chainIDs[0] ?? ""]?.prefix === "kujira"

  useEffect(() => {
    // around 3 minutes with a 10 seconds interval
    let maxIterations = 18

    if (waitUntil) {
      ;(async () => {
        while (maxIterations--) {
          const tokenBalance = await getBalance(
            waitUntil.denom,
            waitUntil?.chainID
          )

          if (Number(tokenBalance) > waitUntil.balance) {
            setWaitUntil(undefined)
            setIsLoading(false)
            // refetch all balances for the next form
            queryClient.invalidateQueries(queryKey.bank.balances)
            return
          }

          await new Promise((resolve) => setTimeout(resolve, 10_000))
        }

        // if this get's executed, it means that the transaction failed
        setWaitUntil(undefined)
        setError("Transaction failed.")
      })()
    }

    return () => {
      maxIterations = 0
    }
  }, [waitUntil]) // eslint-disable-line react-hooks/exhaustive-deps

  const IBCdenom = useMemo(
    () =>
      ibcDetails &&
      calculateIBCDenom(
        isKujira
          ? ibcDetails.baseDenom?.replaceAll("/", ":")
          : ibcDetails.baseDenom,
        ibcDetails.channels
          .slice(0, ibcDetails.channels.length - step)
          .reduce(
            (acc, cur) =>
              acc
                ? [cur.port, cur.channel, acc].join("/")
                : [cur.port, cur.channel].join("/"),
            ""
          )
      ),
    [step, ibcDetails, isKujira]
  )

  const chains = useMemo(
    () => ibcDetails?.chainIDs.slice().reverse() ?? [],
    [ibcDetails]
  )
  const decimals = readNativeDenom(ibcDetails?.baseDenom ?? "").decimals

  const createTx = useCallback(
    ({ input }: TxValues) => {
      if (!ibcDetails || !addresses || !IBCdenom || !input) return

      const { channel, port } =
        ibcDetails.channels[ibcDetails.channels.length - 1 - step]

      const msgs = [
        new MsgTransfer(
          port,
          channel,
          new Coin(IBCdenom, input * 10 ** decimals),
          addresses[chains[step]],
          addresses[chains[step + 1]],
          undefined,
          (Date.now() + 120 * 1000) * 1e6,
          undefined
        ),
      ]

      return { msgs, chainID: chains[step] }
    },
    [ibcDetails, addresses, step, IBCdenom, chains, decimals]
  )

  const onChangeMax = useCallback(
    async (input: number) => {
      setValue("input", input)
      await trigger("input")
    },
    [setValue, trigger]
  )

  const coins = [{ input, denom: IBCdenom }] as CoinInput[]
  const amount = toAmount(input, { decimals })
  const balance =
    balances.find(
      ({ denom, chain }) => denom === IBCdenom && chain === chains[step]
    )?.amount ?? "0"

  const tx = {
    token: IBCdenom ?? "",
    baseDenom: ibcDetails?.baseDenom,
    decimals,
    amount,
    coins,
    chain: chains[step],
    disabled: false,
    balance,
    estimationTxValues: { input: 1 },
    createTx,
    onChangeMax,
    onPost: () => {
      const nextDenom = calculateIBCDenom(
        (isKujira
          ? ibcDetails?.baseDenom?.replaceAll("/", ":")
          : ibcDetails?.baseDenom) ?? "",
        (ibcDetails?.channels ?? [])
          .slice(0, (ibcDetails?.channels.length ?? 0) - step - 1)
          .reduce(
            (acc, cur) =>
              acc
                ? [cur.port, cur.channel, acc].join("/")
                : [cur.port, cur.channel].join("/"),
            ""
          )
      )

      // wait until balance on the other chain is increased
      getBalance(nextDenom, chains[step + 1]).then((balance) =>
        setWaitUntil({ chainID: chains[step + 1], denom: nextDenom, balance })
      )

      setStep((step) => step + 1)
      setIsLoading(true)
    },
    hideLoader: true,
    taxRequired: true,
    queryKeys: [queryKey.bank.balances, queryKey.bank.balance],
    gasAdjustment: 2,
  }

  function renderForm() {
    return (
      // @ts-expect-error
      <Tx {...tx}>
        {({ max, fee, submit }) => (
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
                    toInput(max.amount, decimals),
                    decimals
                  ),
                })}
                token={ibcDetails?.baseDenom}
                inputMode="decimal"
                onFocus={max.reset}
                placeholder={getPlaceholder(decimals)}
              />
            </FormItem>

            {fee.render()}

            {submit.button}
          </Form>
        )}
      </Tx>
    )
  }

  return (
    <article>
      <Steps step={step} chains={chains} isLoading={isLoading} />
      {(() => {
        if (error) {
          return (
            <FlexColumn gap={20}>
              <ReportIcon className={styles.danger} style={{ fontSize: 40 }} />
              <p>{error}</p>
            </FlexColumn>
          )
        }

        if (state.isLoading || isLoading) {
          return (
            <FlexColumn gap={20}>
              <img
                width={120}
                height={120}
                src={animation}
                alt={t("Loading...")}
              />
              {state.isLoading && <p>{t("Loading...")}</p>}
              {isLoading && (
                <>
                  <p>{t("Waiting for on-chain confirmation...")}</p>
                  <p>{t("This may take a few minutes")}</p>
                </>
              )}
            </FlexColumn>
          )
        }

        if (step === chains.length - 1) {
          return (
            <FlexColumn gap={20}>
              <DoneAllIcon
                className={styles.success}
                style={{ fontSize: 40 }}
              />
              <p>{t("Success!")}</p>
            </FlexColumn>
          )
        }

        return renderForm()
      })()}
    </article>
  )
}

export default IbcSendBackTx
