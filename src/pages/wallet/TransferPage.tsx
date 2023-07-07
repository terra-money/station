import {
  AccAddress,
  Coin,
  MsgExecuteContract,
  MsgSend,
  MsgTransfer,
} from "@terra-money/feather.js"
import { isDenom, toAmount } from "@terra-money/terra-utils"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { Form, FormItem, Input, Select } from "components/form"
import ChainSelector from "components/form/Selectors/ChainSelector/ChainSelector"
import { Flex } from "components/layout"
import { useBankBalance } from "data/queries/bank"
import { useExchangeRates } from "data/queries/coingecko"
import { useNativeDenoms } from "data/token"
import { useCallback, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { CoinInput, getPlaceholder, toInput } from "txs/utils"
import styles from "./SendPage.module.scss"
import { useWalletRoute } from "./Wallet"
import validate from "../../txs/validate"
import { useIBCChannels, useWhitelist } from "data/queries/chains"
import CheckIcon from "@mui/icons-material/Check"
import ClearIcon from "@mui/icons-material/Clear"
import { getChainIDFromAddress } from "utils/bech32"
import { useNetwork, useNetworkName } from "data/wallet"
import { queryKey } from "data/query"
import Tx from "txs/Tx"

interface TxValues {
  asset: string
  chain?: string
  destinationChain?: string // chainID
  address?: AccAddress // hidden input
  input?: number
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

const TransferPage = () => {
  const addresses = useInterchainAddresses()
  const networks = useNetwork()
  const { getIBCChannel, getICSContract } = useIBCChannels()
  const { ibcDenoms } = useWhitelist()
  const networkName = useNetworkName()
  const { t } = useTranslation()
  const balances = useBankBalance()
  const { data: prices } = useExchangeRates()
  const readNativeDenom = useNativeDenoms()
  const { route } = useWalletRoute() as unknown as {
    route: { denom?: string }
  }
  const availableAssets = useMemo(
    () =>
      Object.values(
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
        }, {} as Record<string, AssetType>) ?? {}
      ).sort(
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
    destinationChain,
    input,
    decimals,
    chain,
    address: destinationAddress,
    asset,
  } = watch()
  const amount = toAmount(input, { decimals: decimals ?? 6 })
  const availableChains = useMemo(
    () =>
      availableAssets
        .find(({ denom }) => denom === (asset ?? defaultAsset))
        ?.chains.sort((a, b) => {
          if (networks[a]?.prefix === "terra") return -1
          if (networks[b]?.prefix === "terra") return 1
          return 0
        }),
    [asset, availableAssets, defaultAsset, networks]
  )

  const availableDestinations = useMemo(
    () =>
      Object.keys(networks ?? {})
        .filter((chainID) => chainID !== chain)
        .sort((a, b) => {
          if (networks[a]?.prefix === "terra") return -1
          if (networks[b]?.prefix === "terra") return 1
          return 0
        }),
    [networks, availableChains, chain] // eslint-disable-line
  )

  const token = balances.find(
    ({ denom, chain }) =>
      chain === watch("chain") &&
      readNativeDenom(denom).token === watch("asset")
  )

  const { ibc: ibcValidation } = validate.ibc(
    networks,
    chain ?? "",
    token?.denom ?? "",
    getIBCChannel,
    readNativeDenom(token?.denom ?? "").isAxelar
  )

  /* resolve recipient */
  useEffect(() => {
    if (!destinationChain || !addresses) {
      setValue("address", undefined)
    } else {
      setValue("address", addresses[destinationChain])

      const result = ibcValidation(addresses[destinationChain])
      if (result !== true) {
        form.setError("address", { message: result })
      } else {
        form.clearErrors("address")
      }
      form.setFocus("input")
    }
  }, [destinationChain, asset, chain]) // eslint-disable-line

  /* resolve source chain */
  useEffect(() => {
    if (availableChains?.length) {
      setValue("chain", availableChains[0])
    }
  }, [asset]) // eslint-disable-line

  useEffect(() => {
    if (availableDestinations?.length) {
      setValue("destinationChain", availableDestinations[0])
    }
  }, [chain]) // eslint-disable-line

  /* render detected destination chain */
  function renderDestinationChain() {
    if (
      !chain ||
      !destinationAddress ||
      !AccAddress.validate(destinationAddress)
    )
      return null

    const destinationChain = getChainIDFromAddress(destinationAddress, networks)

    if (!destinationChain || !token) return null

    if (
      chain === destinationChain ||
      (getIBCChannel({
        from: chain,
        to: destinationChain,
        tokenAddress: token.denom,
        icsChannel:
          ibcDenoms[networkName][`${chain}:${token.denom}`]?.icsChannel,
      }) &&
        !readNativeDenom(token.denom).isAxelar)
    ) {
      return (
        <span className={styles.destination}>
          <Flex gap={4} start>
            <CheckIcon fontSize="inherit" className={styles.icon} />
            Destination chain:{" "}
            <strong>{networks[destinationChain]?.name}</strong>
          </Flex>
        </span>
      )
    } else {
      return (
        <span className={styles.destination__error}>
          <Flex gap={4} start>
            <ClearIcon fontSize="inherit" className={styles.icon} />
            Destination chain:{" "}
            <strong>{networks[destinationChain]?.name}</strong>
          </Flex>
        </span>
      )
    }
  }

  /* tx */
  const createTx = useCallback(
    ({ address, input }: TxValues) => {
      if (!addresses) return
      if (!(address && AccAddress.validate(address))) return
      const amount = toAmount(input, { decimals })
      const execute_msg = { transfer: { recipient: address, amount } }

      const destinationChain = getChainIDFromAddress(address, networks)

      if (!chain || !destinationChain || !token) return

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

        return { msgs, memo: "", chainID: chain }
      } else {
        const channel = getIBCChannel({
          from: chain,
          to: destinationChain,
          tokenAddress: token.denom,
          icsChannel:
            ibcDenoms[networkName][`${chain}:${token.denom}`]?.icsChannel,
        })
        if (!channel) throw new Error("No IBC channel found")

        const msgs = AccAddress.validate(token?.denom ?? "")
          ? [
              new MsgExecuteContract(
                addresses[token?.chain ?? ""],
                token?.denom ?? "",
                {
                  send: {
                    contract: getICSContract({
                      from: chain,
                      to: destinationChain,
                    }),
                    amount: amount,
                    msg: Buffer.from(
                      JSON.stringify({
                        channel,
                        remote_address: address,
                      })
                    ).toString("base64"),
                  },
                }
              ),
            ]
          : [
              new MsgTransfer(
                "transfer",
                channel,
                new Coin(token?.denom ?? "", amount),
                addresses[token?.chain ?? ""],
                address,
                undefined,
                (Date.now() + 120 * 1000) * 1e6,
                undefined
              ),
            ]

        return { msgs, memo: "", chainID: chain }
      }
    },
    [
      addresses,
      decimals,
      chain,
      networks,
      getIBCChannel,
      getICSContract,
      ibcDenoms,
      networkName,
      token,
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
    token: token?.denom ?? "",
    decimals,
    amount,
    coins,
    chain,
    balance: token?.amount ?? "0",
    estimationTxValues,
    createTx,
    disabled: false,
    onChangeMax,
    taxRequired: true,
    queryKeys: [queryKey.bank.balances, queryKey.bank.balance],
    gasAdjustment:
      getChainIDFromAddress(addresses?.[chain ?? ""], networks) !== chain &&
      AccAddress.validate(token?.denom ?? "")
        ? 1.5
        : 1,
  }

  return (
    // @ts-expect-error
    <Tx {...tx}>
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)} className={styles.form}>
          <section className={styles.send}>
            <div className={styles.form__container}>
              <h1>{t("Transfer")}</h1>

              <FormItem label={t("Asset")} error={errors.asset?.message}>
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
                <FormItem label={t("Source chain")}>
                  <ChainSelector
                    value={chain ?? ""}
                    chainsList={availableChains}
                    onChange={(chain) => setValue("chain", chain)}
                  />
                </FormItem>
              )}
              {destinationChain && (
                <FormItem
                  label={t("Destination chain")}
                  extra={renderDestinationChain()}
                  error={errors.address?.message}
                >
                  <ChainSelector
                    value={destinationChain ?? ""}
                    chainsList={availableDestinations}
                    onChange={(chain) => setValue("destinationChain", chain)}
                  />

                  <input
                    {...register("address", {
                      validate: {
                        ...validate.ibc(
                          networks,
                          chain ?? "",
                          token?.denom ?? "",
                          getIBCChannel,
                          readNativeDenom(token?.denom ?? "").isAxelar
                        ),
                      },
                    })}
                    readOnly
                    hidden
                  />
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

              {fee.render()}
            </div>
          </section>
          <section className={styles.actions}>{submit.button}</section>
        </Form>
      )}
    </Tx>
  )
}

export default TransferPage
