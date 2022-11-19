import {
  AccAddress,
  Coin,
  MsgExecuteContract,
  MsgSend,
  MsgTransfer,
} from "@terra-money/station.js"
import { isDenom, toAmount } from "@terra.kitchen/utils"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { Form, FormItem, FormWarning, Input, Select } from "components/form"
import ChainSelector from "components/form/ChainSelector"
import { Flex, Grid } from "components/layout"
import { SAMPLE_ADDRESS } from "config/constants"
import { useBankBalance } from "data/queries/bank"
import { useMemoizedPrices } from "data/queries/coingecko"
import { useNativeDenoms } from "data/token"
import { useCallback, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import InterchainTx from "txs/InterchainTx"
import TxContext from "txs/TxContext"
import { CoinInput, getPlaceholder, toInput } from "txs/utils"
import styles from "./SendPage.module.scss"
import { useWalletRoute } from "./Wallet"
import validate from "../../txs/validate"
import { useChains, useIBCChannels } from "data/queries/chains"
import CheckIcon from "@mui/icons-material/Check"
import { getChainIDFromAddress } from "utils/bech32"

interface TxValues {
  asset: string
  chain?: string
  recipient?: string // AccAddress | TNS
  address?: AccAddress // hidden input
  input?: number
  memo?: string
  decimals?: number
}

interface AssetType {
  denom: string
  balance: string
  icon: string
  symbol: string
  price: number
  chains: string[]
}

const SendPage = () => {
  const addresses = useInterchainAddresses()
  const chains = useChains()
  const getIBCChannel = useIBCChannels()
  const { t } = useTranslation()
  const balances = useBankBalance()
  const { data: prices } = useMemoizedPrices()
  const readNativeDenom = useNativeDenoms()
  const { route } = useWalletRoute() as unknown as { route: { denom?: string } }
  const availableAssets = useMemo(
    () =>
      [
        ...Object.values(
          (balances ?? []).reduce((acc, { denom, amount, chain }) => {
            const data = readNativeDenom(denom)
            if (acc[data.token]) {
              acc[data.token].balance = `${
                parseInt(acc[data.token].balance) + parseInt(amount)
              }`
              acc[data.token].chains.push(chain)
              return acc as Record<string, AssetType>
            } else {
              return {
                ...acc,
                [data.token]: {
                  denom: data.token,
                  balance: amount,
                  icon: data.icon,
                  symbol: data.symbol,
                  price: prices?.[data.token]?.price ?? 0,
                  chains: [chain],
                },
              } as Record<string, AssetType>
            }
          }, {} as Record<string, AssetType>)
        ),
      ].sort(
        (a, b) => b.price * parseInt(b.balance) - a.price * parseInt(a.balance)
      ),
    [balances, readNativeDenom, prices]
  )
  const defaultAsset = route?.denom || availableAssets[0].denom

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { register, trigger, watch, setValue, handleSubmit } = form
  const { formState } = form
  const { errors } = formState
  const {
    recipient,
    input,
    memo,
    decimals,
    chain,
    address: destinationAddress,
    asset,
  } = watch()
  const amount = toAmount(input, { decimals: decimals ?? 6 })
  const availableChains = availableAssets.find(
    ({ denom }) => denom === (asset ?? defaultAsset)
  )?.chains

  /* resolve recipient */
  useEffect(() => {
    if (!recipient) {
      setValue("address", undefined)
    } else if (AccAddress.validate(recipient)) {
      setValue("address", recipient)
      form.setFocus("input")
    } else {
      setValue("address", recipient)
    }
  }, [form, recipient, setValue])

  /* render detected destination chain */
  function renderDestinationChain() {
    if (!destinationAddress || !AccAddress.validate(destinationAddress))
      return null
    const addressPrefix = AccAddress.getPrefix(destinationAddress)
    return (
      <span className={styles.destination}>
        <Flex gap={4} start>
          <CheckIcon fontSize="inherit" className={styles.icon} />
          Destination chain:{" "}
          <strong>
            {
              Object.values(chains).find(
                ({ prefix }) => prefix === addressPrefix
              )?.name
            }
          </strong>
        </Flex>
      </span>
    )
  }

  /* tx */
  const createTx = useCallback(
    ({ address, input, memo }: TxValues) => {
      if (!addresses) return
      if (!(address && AccAddress.validate(address))) return
      const amount = toAmount(input, { decimals })
      const execute_msg = { transfer: { recipient: address, amount } }

      const token = balances.find(
        ({ denom, chain }) =>
          chain === watch("chain") &&
          readNativeDenom(denom).token === watch("asset")
      )

      const destinationChain = getChainIDFromAddress(address, chains)

      if (!chain || !destinationChain) return

      if (destinationChain === chain) {
        const msgs = isDenom(token?.denom)
          ? [
              new MsgSend(
                addresses[token?.chain ?? ""],
                address,
                amount + token?.denom
              ),
            ]
          : [
              new MsgExecuteContract(
                addresses[token?.chain ?? ""],
                token?.denom ?? "",
                execute_msg
              ),
            ]

        return { msgs, memo, chainID: chain }
      } else {
        const msgs = isDenom(token?.denom)
          ? [
              new MsgTransfer(
                "transfer",
                getIBCChannel({ from: chain, to: destinationChain }),
                new Coin(token?.denom ?? "", amount),
                addresses[token?.chain ?? ""],
                address,
                undefined,
                (Date.now() + 120 * 1000) * 1e6
              ),
            ]
          : [] // TODO: integrate ICS20
        return { msgs, memo, chainID: chain }
      }
    },
    [
      addresses,
      decimals,
      balances,
      chain,
      readNativeDenom,
      watch,
      chains,
      getIBCChannel,
    ]
  )

  const onChangeMax = useCallback(
    async (input: number) => {
      setValue("input", input)
      await trigger("input")
    },
    [setValue, trigger]
  )

  /* fee */
  const coins = [{ input, denom: "" }] as CoinInput[]
  const estimationTxValues = useMemo(() => {
    return {
      address: addresses?.[chain ?? "phoenix-1"],
      input: toInput(1, decimals),
    }
  }, [addresses, decimals, chain])

  const tx = {
    token: "",
    decimals,
    amount,
    coins,
    chain,
    balance:
      balances.find(
        ({ denom, chain }) =>
          chain === watch("chain") &&
          readNativeDenom(denom).token === watch("asset")
      )?.amount ?? "0",
    estimationTxValues,
    createTx,
    disabled: false,
    onChangeMax,
    onSuccess: { label: t("Wallet"), path: "/wallet" },
    taxRequired: true,
  }

  return (
    <TxContext>
      {/* @ts-ignore */}
      <InterchainTx {...tx}>
        {({ max, fee, submit }) => (
          <Form onSubmit={handleSubmit(submit.fn)} className={styles.form}>
            <section className={styles.send}>
              <div className={styles.form__container}>
                <h1>{t("Send")}</h1>

                <FormItem
                  label={t("Asset")}
                  error={errors.asset?.message ?? errors.address?.message}
                >
                  <Select
                    {...register("asset", {
                      value: defaultAsset,
                    })}
                    autoFocus
                  >
                    {availableAssets.map(({ denom, symbol }) => (
                      <option value={denom}>{symbol}</option>
                    ))}
                  </Select>
                </FormItem>
                {availableChains && (
                  <FormItem
                    label={t("Source chain")}
                    //extra={renderResolvedAddress()}
                    error={errors.asset?.message ?? errors.address?.message}
                  >
                    <ChainSelector
                      chainsList={availableChains}
                      onChange={(chain) => setValue("chain", chain)}
                    />
                  </FormItem>
                )}
                <FormItem
                  label={t("Recipient")}
                  extra={renderDestinationChain()}
                  error={errors.recipient?.message ?? errors.address?.message}
                >
                  <Input
                    {...register("recipient", {
                      validate: validate.recipient(),
                    })}
                    placeholder={SAMPLE_ADDRESS}
                    autoFocus
                  />

                  <input {...register("address")} readOnly hidden />
                </FormItem>

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
                    token={asset}
                    inputMode="decimal"
                    onFocus={max.reset}
                    placeholder={getPlaceholder(decimals)}
                  />
                </FormItem>

                <FormItem
                  label={`${t("Memo")} (${t("optional")})`}
                  error={errors.memo?.message}
                >
                  <Input
                    {...register("memo", {
                      validate: {
                        size: validate.size(256, "Memo"),
                        brackets: validate.memo(),
                      },
                    })}
                  />
                </FormItem>

                {fee.render()}
              </div>
              <Grid gap={4}>
                {!memo && (
                  <FormWarning>
                    {t("Check if this transaction requires a memo")}
                  </FormWarning>
                )}
              </Grid>
            </section>
            <section className={styles.actions}>{submit.button}</section>
          </Form>
        )}
      </InterchainTx>
    </TxContext>
  )
}

export default SendPage
