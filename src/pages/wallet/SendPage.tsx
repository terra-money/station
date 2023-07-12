import {
  AccAddress,
  Coin,
  MsgExecuteContract,
  MsgSend,
  MsgTransfer,
} from "@terra-money/feather.js"
import { toAmount } from "@terra-money/terra-utils"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { Form, FormItem, FormWarning, Input } from "components/form"
import ChainSelector from "components/form/Selectors/ChainSelector/ChainSelector"
import { Flex, Grid } from "components/layout"
import { SAMPLE_ADDRESS } from "config/constants"
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
import ContactsIcon from "@mui/icons-material/Contacts"
import { getChainIDFromAddress } from "utils/bech32"
import { useNetwork, useNetworkName } from "data/wallet"
import { queryKey } from "data/query"
import Tx from "txs/Tx"
import AddressBookList from "txs/AddressBook/AddressBookList"
import { ModalButton } from "components/feedback"
import AssetSelector from "components/form/Selectors/AssetSelector/AssetSelector"

interface TxValues {
  asset?: string
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
          // TODO: resolve ibc lun(a|c) balances better at balance fetch
          // then update max / balance / messaging to translate lun(a|c)
          // for now, check if token is LUNC and network isn't classic, discard if so
          if (data?.symbol === "LUNC" && networkName !== "classic")
            return acc as Record<string, AssetType>

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
    [balances, readNativeDenom, networkName, prices]
  )
  const defaultAsset = route?.denom || availableAssets[0].denom

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { register, trigger, watch, setValue, handleSubmit, reset } = form
  const { formState } = form
  const { errors } = formState
  const {
    recipient,
    input,
    memo,
    chain,
    address: destinationAddress,
    asset,
  } = watch()

  const decimals = asset ? readNativeDenom(asset).decimals : 6

  const amount = toAmount(input, { decimals })

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

  const token = balances.find(
    ({ denom, chain }) =>
      chain === watch("chain") &&
      readNativeDenom(denom).token === watch("asset")
  )

  /* resolve asset */
  useEffect(() => {
    if (!asset) {
      setValue("asset", defaultAsset)
    }
  }, [form, asset, defaultAsset, setValue])

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

  /* resolve source chain */
  useEffect(() => {
    if (availableChains?.length) {
      setValue("chain", availableChains[0])
    }
  }, [asset]) // eslint-disable-line

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
      getIBCChannel({
        from: chain,
        to: destinationChain,
        tokenAddress: token.denom,
        icsChannel:
          ibcDenoms[networkName][`${chain}:${token.denom}`]?.icsChannel,
      })
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
    ({ address, input, memo }: TxValues) => {
      if (!addresses) return
      if (!(address && AccAddress.validate(address))) return
      const amount = toAmount(input, { decimals })
      const execute_msg = { transfer: { recipient: address, amount } }

      const destinationChain = getChainIDFromAddress(address, networks)

      if (!chain || !destinationChain || !token) return

      if (destinationChain === chain) {
        const msgs = AccAddress.validate(token?.denom)
          ? [
              new MsgExecuteContract(
                addresses[token?.chain ?? ""],
                token?.denom ?? "",
                execute_msg
              ),
            ]
          : [
              new MsgSend(
                addresses[token?.chain ?? ""],
                address,
                amount + token?.denom
              ),
            ]

        return { msgs, memo, chainID: chain }
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

        return { msgs, memo, chainID: chain }
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
    onSuccess: () => reset(),
    taxRequired: true,
    queryKeys: [queryKey.bank.balances, queryKey.bank.balance],
    gasAdjustment:
      getChainIDFromAddress(destinationAddress, networks) !== chain ? 2 : 1,
  }

  useEffect(() => {
    if (chain && recipient) {
      trigger("recipient")
    }
  }, [chain, trigger, recipient])

  const filteredAssets = useMemo(
    () => availableAssets.filter(({ symbol }) => !symbol.endsWith("...")),
    [availableAssets]
  )

  const assetsByDenom = filteredAssets.reduce(
    (acc: Record<string, AssetType>, item: AssetType) => {
      acc[item.denom] = item
      return acc
    },
    {}
  )

  return (
    // @ts-expect-error
    <Tx {...tx}>
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)} className={styles.form}>
          <section className={styles.send}>
            <div className={styles.form__container}>
              <div className={styles.form__header__wrapper}>
                <h1>{t("Send")}</h1>
              </div>
              <FormItem
                label={t("Asset")}
                error={errors.asset?.message ?? errors.address?.message}
              >
                <AssetSelector
                  value={asset ?? ""}
                  onChange={(asset) => setValue("asset", asset)}
                  assetList={filteredAssets}
                  assetsByDenom={assetsByDenom}
                />
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
              <FormItem
                label={t("Recipient")}
                extra={renderDestinationChain()}
                error={errors.recipient?.message ?? errors.address?.message}
              >
                <ModalButton
                  title={t("Address book")}
                  renderButton={(open) => (
                    <Input
                      {...register("recipient", {
                        validate: {
                          ...validate.recipient(),
                          ...validate.ibc(
                            networks,
                            chain ?? "",
                            token?.denom ?? "",
                            getIBCChannel,
                            readNativeDenom(token?.denom ?? "").isAxelar
                          ),
                        },
                      })}
                      placeholder={SAMPLE_ADDRESS}
                      actionButton={{
                        icon: <ContactsIcon />,
                        onClick: open,
                      }}
                      autoFocus
                    />
                  )}
                >
                  <AddressBookList
                    onClick={async ({ recipient, memo }) => {
                      setValue("recipient", recipient)
                      memo && setValue("memo", memo)
                      await trigger("recipient")
                    }}
                  />
                </ModalButton>

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

              {!destinationAddress ||
              getChainIDFromAddress(destinationAddress, networks) === chain ? (
                <>
                  <FormItem
                    label={`${t("Memo")} (${t("optional")})`}
                    error={errors.memo?.message}
                  >
                    <Input
                      {...register("memo", {
                        validate: {
                          size: validate.size(256, "Memo"),
                          brackets: validate.memo(),
                          mnemonic: validate.isNotMnemonic(),
                        },
                      })}
                    />
                  </FormItem>

                  <Grid gap={4}>
                    {!memo && (
                      <FormWarning>
                        {t("Check if this transaction requires a memo")}
                      </FormWarning>
                    )}
                  </Grid>
                </>
              ) : (
                <Grid gap={4}>
                  {!memo && (
                    <FormWarning>
                      {t(
                        "This is a cross-chain transaction. Don't send tokens to exchanges with this tx."
                      )}
                    </FormWarning>
                  )}
                </Grid>
              )}

              {fee.render()}
            </div>
          </section>
          <section className={styles.actions}>{submit.button}</section>
        </Form>
      )}
    </Tx>
  )
}

export default SendPage
