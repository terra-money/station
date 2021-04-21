import { Fragment, ReactNode } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { QueryKey, useQuery } from "react-query"
import { useRecoilValue, useSetRecoilState } from "recoil"
import classNames from "classnames"
import BigNumber from "bignumber.js"
import { head, isNil } from "ramda"

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import { isDenomIBC, isDenomTerraNative } from "@terra.kitchen/utils"
import { isDenom, readDenom } from "@terra.kitchen/utils"
import { Coin, Coins, LCDClient } from "@terra-money/terra.js"
import { CreateTxOptions, Fee } from "@terra-money/terra.js"
import { UserDenied } from "@terra-money/wallet-provider"
import { CreateTxFailed, TxFailed } from "@terra-money/wallet-provider"
import { useWallet, useConnectedWallet } from "@terra-money/wallet-provider"

import { Contents } from "types/components"
import { has } from "utils/num"
import { getAmount, sortCoins } from "utils/coin"
import { getErrorMessage } from "utils/error"
import { useCurrency } from "data/settings/Currency"
import { queryKey, combineState, RefetchOptions } from "data/query"
import { useAddress } from "data/wallet"
import { isBroadcastingState, latestTxState } from "data/queries/tx"
import { useBankBalance, useIsWalletEmpty } from "data/queries/bank"
import { getShouldTax, useTaxCap, useTaxRate } from "data/queries/treasury"

import { Pre } from "components/general"
import { Flex, Grid } from "components/layout"
import { FormError, Submit, Select, Input, FormItem } from "components/form"
import { Modal } from "components/feedback"
import { Details } from "components/display"
import { Read } from "components/token"
import ConnectWallet from "app/sections/ConnectWallet"
import { useAuth } from "auth"
import { PasswordError } from "auth/scripts/keystore"

import { toInput } from "./utils"
import { useTx } from "./TxContext"
import styles from "./Tx.module.scss"

interface Props<TxValues> {
  /* Only when the token is paid out of the balance held */
  token?: Token
  decimals?: number
  amount?: Amount
  balance?: Amount

  /* tx simulation */
  initialGasDenom: CoinDenom
  estimationTxValues?: TxValues
  createTx: (values: TxValues) => CreateTxOptions | undefined
  gasAdjustment?: number
  preventTax?: boolean
  taxes?: Coins
  excludeGasDenom?: (denom: string) => boolean

  /* render */
  disabled?: string | false
  children: (props: RenderProps<TxValues>) => ReactNode
  onChangeMax?: (input: number) => void

  /* on tx success */
  onPost?: () => void
  redirectAfterTx?: { label: string; path: string }
  queryKeys?: QueryKey[]
}

type RenderMax = (onClick?: (max: Amount) => void) => ReactNode
interface RenderProps<TxValues> {
  max: { amount: Amount; render: RenderMax; reset: () => void }
  fee: { render: (descriptions?: Contents) => ReactNode }
  submit: { fn: (values: TxValues) => Promise<void>; button: ReactNode }
}

function Tx<TxValues>(props: Props<TxValues>) {
  const { token, decimals, amount, balance } = props
  const { initialGasDenom, estimationTxValues, createTx } = props
  const { gasAdjustment = 1, preventTax, excludeGasDenom } = props
  const { children, onChangeMax } = props
  const { onPost, redirectAfterTx, queryKeys } = props

  const [isMax, setIsMax] = useState(false)
  const [gasDenom, setGasDenom] = useState(initialGasDenom)

  /* context */
  const { t } = useTranslation()
  const currency = useCurrency()
  const { network, post } = useWallet()
  const connectedWallet = useConnectedWallet()
  const { wallet, validatePassword, ...auth } = useAuth()
  const address = useAddress()
  const isWalletEmpty = useIsWalletEmpty()
  const setLatestTx = useSetRecoilState(latestTxState)
  const isBroadcasting = useRecoilValue(isBroadcastingState)
  const bankBalance = useBankBalance()
  const { gasPrices } = useTx()

  /* queries: conditional */
  const shouldTax = !preventTax && getShouldTax(token)
  const { data: rate = "0", ...taxRateState } = useTaxRate(!shouldTax)
  const { data: cap = "0", ...taxCapState } = useTaxCap(token)
  const taxState = combineState(taxRateState, taxCapState)

  /* simulation: estimate gas */
  const simulationTx = estimationTxValues && createTx(estimationTxValues)
  const key = {
    address,
    network,
    initialGasDenom,
    gasPrices,
    gasAdjustment,
    tx: simulationTx,
  }

  const { data: estimatedGas, ...estimatedGasState } = useQuery(
    [queryKey.tx.create, key],
    async () => {
      if (!address || isWalletEmpty) return 0
      if (!(wallet || connectedWallet?.availablePost)) return 0
      if (!simulationTx || !simulationTx.msgs.length) return 0

      const config = {
        ...network,
        URL: network.lcd,
        gasPrices: { [initialGasDenom]: gasPrices[initialGasDenom] },
      }

      const lcd = new LCDClient(config)

      const unsignedTx = await lcd.tx.create([{ address }], {
        ...simulationTx,
        feeDenoms: [initialGasDenom],
      })

      return Math.ceil(unsignedTx.auth_info.fee.gas_limit * gasAdjustment)
    },
    {
      ...RefetchOptions.INFINITY,
      // To handle sequence mismatch
      retry: 3,
      retryDelay: 1000,
      // Because the focus occurs once when posting back from the extension
      refetchOnWindowFocus: false,
      enabled: !isBroadcasting,
    }
  )

  const getGasAmount = useCallback(
    (denom: CoinDenom) => {
      const gasPrice = gasPrices[denom]
      if (isNil(estimatedGas) || !gasPrice) return "0"
      return new BigNumber(estimatedGas)
        .times(gasPrice)
        .integerValue(BigNumber.ROUND_CEIL)
        .toString()
    },
    [estimatedGas, gasPrices]
  )

  const gasAmount = getGasAmount(gasDenom)
  const gasFee = { amount: gasAmount, denom: gasDenom }

  /* max */
  const getNativeMax = () => {
    if (!balance) return
    const gasAmount = gasFee.denom === initialGasDenom ? gasFee.amount : "0"
    return calcMax({ balance, rate, cap, gasAmount }).max
  }

  const max = !gasFee.amount
    ? undefined
    : isDenom(token)
    ? getNativeMax()
    : balance

  /* (effect): Call the onChangeMax function whenever the max changes */
  useEffect(() => {
    if (max && isMax && onChangeMax) onChangeMax(toInput(max, decimals))
  }, [decimals, isMax, max, onChangeMax])

  /* tax */
  const taxAmount =
    token && amount && shouldTax
      ? calcMinimumTaxAmount(amount, { rate, cap })
      : undefined

  /* (effect): Log error on console */
  const failed = getErrorMessage(taxState.error ?? estimatedGasState.error)
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && failed) {
      console.groupCollapsed("Fee estimation failed")
      console.info(simulationTx?.msgs.map((msg) => msg.toData()))
      console.info(failed)
      console.groupEnd()
    }
  }, [failed, simulationTx])

  /* submit */
  const disabled = taxState.isLoading
    ? t("Loading tax data...")
    : taxState.error
    ? t("Failed to load tax data")
    : estimatedGasState.isLoading
    ? t("Estimating fee...")
    : estimatedGasState.error
    ? t("Fee estimation failed")
    : isBroadcasting
    ? t("Broadcasting a tx...")
    : props.disabled || ""

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<Error>()

  const [password, setPassword] = useState("")
  const [incorrect, setIncorrect] = useState<string>()

  const submit = async (values: TxValues) => {
    setSubmitting(true)

    try {
      if (disabled) throw new Error(disabled)
      if (!estimatedGas || !has(gasAmount))
        throw new Error("Gas is not estimated")

      const tx = createTx(values)

      if (!tx) throw new Error("Tx is not defined")

      const gasCoins = new Coins([Coin.fromData(gasFee)])
      const taxCoin = token && taxAmount && new Coin(token, taxAmount)
      const taxCoins = props.taxes ?? taxCoin
      const feeCoins = taxCoins ? gasCoins.add(taxCoins) : gasCoins
      const fee = new Fee(estimatedGas, feeCoins)

      if (wallet) {
        const { result } = await auth.post({ ...tx, fee }, password)
        setLatestTx({ txhash: result.txhash, queryKeys, redirectAfterTx })
      } else {
        const { result } = await post({ ...tx, fee })
        setLatestTx({ txhash: result.txhash, queryKeys, redirectAfterTx })
      }

      onPost?.()
    } catch (error) {
      if (error instanceof PasswordError) setIncorrect(error.message)
      else setError(error as Error)
    }

    setSubmitting(false)
  }

  /* render */
  const balanceAfterTx =
    balance &&
    amount &&
    new BigNumber(balance)
      .minus(amount)
      .minus(taxAmount ?? 0)
      .minus((gasFee.denom === token && gasFee.amount) || 0)
      .toString()

  const insufficient = balanceAfterTx
    ? new BigNumber(balanceAfterTx).lt(0)
    : false

  const availableGasDenoms = useMemo(() => {
    return sortCoins(bankBalance, currency)
      .map(({ denom }) => denom)
      .filter(
        (denom) =>
          !excludeGasDenom?.(denom) &&
          !isDenomIBC(denom) &&
          new BigNumber(getAmount(bankBalance, denom)).gte(getGasAmount(denom))
      )
  }, [bankBalance, currency, excludeGasDenom, getGasAmount])

  useEffect(() => {
    if (availableGasDenoms.includes(initialGasDenom)) return
    setGasDenom(availableGasDenoms[0])
  }, [availableGasDenoms, initialGasDenom])

  /* element */
  const resetMax = () => setIsMax(false)
  const renderMax: RenderMax = (onClick) => {
    if (!(max && has(max))) return null

    return (
      <button
        type="button"
        className={classNames({ muted: !isMax })}
        onClick={onClick ? () => onClick(max) : () => setIsMax(!isMax)}
      >
        <Flex gap={4} start>
          <AccountBalanceWalletIcon
            fontSize="inherit"
            className={styles.icon}
          />
          <Read amount={max} token={token} decimals={decimals} />
        </Flex>
      </button>
    )
  }

  const renderFee = (descriptions?: Contents) => {
    if (!estimatedGas) return null

    const taxes = sortCoins(props.taxes ?? new Coins(), currency).filter(
      ({ amount }) => has(amount)
    )

    return (
      <Details>
        <dl>
          {descriptions?.map(({ title, content }) => (
            <Fragment key={title}>
              <dt>{title}</dt>
              <dd>{content}</dd>
            </Fragment>
          ))}

          {has(taxAmount) && (
            <>
              <dt>{t("Tax")}</dt>
              <dd>
                <Read amount={taxAmount} token={token} />
              </dd>
            </>
          )}

          {!!taxes.length && (
            <>
              <dt>{t("Tax")}</dt>
              <dd>
                {taxes.map((coin) => (
                  <p key={coin.denom}>
                    <Read {...coin} />
                  </p>
                ))}
              </dd>
            </>
          )}

          <dt className={styles.gas}>
            {t("Gas")}
            {availableGasDenoms.length > 1 && (
              <Select
                value={gasDenom}
                onChange={(e) => setGasDenom(e.target.value)}
                className={styles.select}
                small
              >
                {availableGasDenoms.map((denom) => (
                  <option value={denom} key={denom}>
                    {readDenom(denom)}
                  </option>
                ))}
              </Select>
            )}
          </dt>
          <dd>{gasFee.amount && <Read {...gasFee} />}</dd>

          {balanceAfterTx && (
            <>
              <dt>{t("Balance")}</dt>
              <dd>
                <Read amount={balance} token={token} decimals={decimals} />
              </dd>

              <dt>{t("Balance after tx")}</dt>
              <dd>
                <Read
                  amount={balanceAfterTx}
                  token={token}
                  decimals={decimals}
                  className={classNames(insufficient && "danger")}
                />
              </dd>
            </>
          )}
        </dl>
      </Details>
    )
  }

  const submitButton = (
    <>
      {isWalletEmpty && (
        <FormError>{t("Coins required to post transactions")}</FormError>
      )}

      {!address ? (
        <ConnectWallet
          renderButton={(open) => (
            <Submit type="button" onClick={open}>
              {t("Connect wallet")}
            </Submit>
          )}
        />
      ) : (
        <Grid gap={4}>
          {wallet && (
            <FormItem label={t("Password")} error={incorrect}>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setIncorrect(undefined)
                  setPassword(e.target.value)
                }}
              />
            </FormItem>
          )}

          {failed && <FormError>{failed}</FormError>}

          <Submit
            disabled={!estimatedGas || !!disabled}
            submitting={submitting}
          >
            {disabled}
          </Submit>
        </Grid>
      )}
    </>
  )

  const modal = !error
    ? undefined
    : {
        title:
          error instanceof UserDenied
            ? t("User denied")
            : error instanceof CreateTxFailed
            ? t("Failed to create tx")
            : error instanceof TxFailed
            ? t("Tx failed")
            : t("Error"),
        children:
          error instanceof UserDenied ? null : (
            <Pre height={120} normal break>
              {error.message}
            </Pre>
          ),
      }

  return (
    <>
      {children({
        max: { amount: max ?? "0", render: renderMax, reset: resetMax },
        fee: { render: renderFee },
        submit: { fn: submit, button: submitButton },
      })}

      {modal && (
        <Modal
          {...modal}
          icon={<ErrorOutlineIcon fontSize="inherit" className="danger" />}
          onRequestClose={() => setError(undefined)}
          isOpen
        />
      )}
    </>
  )
}

export default Tx

/* utils */
export const getInitialGasDenom = (bankBalance: Coins, token?: Token) => {
  const denom = isDenomTerraNative(token)
    ? token
    : head(sortCoins(bankBalance))?.denom

  return denom ?? "uluna"
}

interface Params {
  balance: Amount
  rate: string
  cap: Amount
  gasAmount: Amount
}

// Receive tax and gas information and return the maximum payment amount
export const calcMax = ({ balance, rate, cap, gasAmount }: Params) => {
  const available = new BigNumber(balance).minus(gasAmount)

  const tax = calcMinimumTaxAmount(available, {
    rate: new BigNumber(rate).div(new BigNumber(1).plus(rate)),
    cap,
  })

  const max = BigNumber.max(new BigNumber(available).minus(tax ?? 0), 0)
    .integerValue(BigNumber.ROUND_FLOOR)
    .toString()

  return { max, tax }
}

export const calcMinimumTaxAmount = (
  amount: BigNumber.Value,
  { rate, cap }: { rate: BigNumber.Value; cap: BigNumber.Value }
) => {
  const tax = BigNumber.min(
    new BigNumber(amount).times(rate),
    cap
  ).integerValue(BigNumber.ROUND_FLOOR)

  return tax.gt(0) ? tax.toString() : undefined
}

/* hooks */
export const useTxKey = () => {
  const { txhash } = useRecoilValue(latestTxState)
  const [key, setKey] = useState(txhash)

  useEffect(() => {
    if (txhash) setKey(txhash)
  }, [txhash])

  return key
}
