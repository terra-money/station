import { Fragment, useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import PersonIcon from "@mui/icons-material/Person"
import { AccAddress, Coin, Coins, Fee, Msg } from "@terra-money/terra.js"
import { MsgExecuteContract, MsgSend } from "@terra-money/terra.js"
import { isDenom, toAmount, truncate } from "@terra.kitchen/utils"
import { SAMPLE_ADDRESS } from "config/constants"
import { queryKey } from "data/query"
import { useAddress, useChainID } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { useTnsAddress } from "data/external/tns"
import { ExternalLink } from "components/general"
import { Auto, Card, Grid, InlineFlex } from "components/layout"
import { Form, FormItem, FormHelp, Input, FormWarning } from "components/form"
import AddressBookList from "../AddressBook/AddressBookList"
import { getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Tx, { getInitialGasDenom } from "../Tx"
import { RN_APIS, WebViewMessage } from "../../utils/rnModule"
import styles from "../../components/form/Form.module.scss"
import useAuth from "../../auth/hooks/useAuth"

interface TxValues {
  recipient?: string // AccAddress | TNS
  address?: AccAddress // hidden input
  input?: number
  memo?: string
}

interface Props {
  action: any
  payload: any
}

const ConfirmForm = ({ action, payload }: Props) => {
  const { t } = useTranslation()
  const connectedAddress = useAddress()
  const bankBalance = useBankBalance()
  const chainID = useChainID()
  const { post } = useAuth()

  const [peerData, setPeerData] = useState<any>(null)
  const [tx, setTx] = useState<any>(null)
  const [msgs, setMsgs] = useState<any>(null)
  const [fee, setFee] = useState<any>(null)

  /* tx context */
  const initialGasDenom = getInitialGasDenom(bankBalance)

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { register, trigger, watch, setValue, setError, handleSubmit } = form
  const { formState } = form
  const { errors } = formState
  const { recipient, input, memo } = watch()

  const onClickAddressBookItem = async ({ recipient, memo }: AddressBook) => {
    setValue("recipient", recipient)
    setValue("memo", memo)
    await trigger("recipient")
  }

  /* resolve recipient */
  const { data: resolvedAddress, ...tnsState } = useTnsAddress(recipient ?? "")
  useEffect(() => {
    if (!recipient) {
      setValue("address", undefined)
    } else if (AccAddress.validate(recipient)) {
      setValue("address", recipient)
      form.setFocus("input")
    } else if (resolvedAddress) {
      setValue("address", resolvedAddress)
    } else {
      setValue("address", recipient)
    }
  }, [form, recipient, resolvedAddress, setValue])

  // validate(tns): not found
  const invalid =
    recipient?.endsWith(".ust") && !tnsState.isLoading && !resolvedAddress
      ? t("Address not found")
      : ""

  const disabled =
    invalid || (tnsState.isLoading && t("Searching for address..."))

  useEffect(() => {
    if (invalid) setError("recipient", { type: "invalid", message: invalid })
  }, [invalid, setError])

  const connectWallet = async () => {
    console.log(payload, chainID, connectedAddress)
    const res = await WebViewMessage(RN_APIS.CONNECT_WALLET, {
      chainID,
      userAddress: connectedAddress,
    })
    console.log("connectWallet", res)

    if (res) {
      alert("wallet connected")
    }
    return res
  }

  const readyConnect = async () => {
    const res = await WebViewMessage(RN_APIS.READY_CONNECT_WALLET, {
      uri: decodeURIComponent(payload),
    })
    console.log("ready connect", res)

    setPeerData(res)
  }

  useEffect(() => {
    peerData && setPeerData(null)
    console.log(payload)
    if (payload) {
      setTx({
        txData: payload,
        initialGasDenom: "uluna",
        onSuccess: { label: t("Wallet"), path: "/wallet" },
      })
      if (action === "wallet_connect") {
        readyConnect()
      } else {
        payload?.params?.msgs &&
          setMsgs(payload?.params?.msgs.map((item: string) => JSON.parse(item)))
        payload?.params?.fee && setFee(JSON.parse(payload?.params?.fee))
      }
    }
  }, [action, payload])

  return (
    <Auto
      columns={[
        <Card isFetching={tnsState.isLoading}>
          <Tx {...tx}>
            {({ max, fee, submit, confirm }) => (
              <Form onSubmit={handleSubmit(confirm.fn)}>
                {peerData ? (
                  <dl>
                    {Object.entries(peerData).map(([key, value]) => {
                      if (["name", "url"].includes(key)) {
                        return (
                          <Fragment key={key}>
                            <dt>{key}</dt>
                            <dd
                              style={{
                                maxWidth: "200px",
                              }}
                            >
                              {JSON.stringify(value)}
                            </dd>
                          </Fragment>
                        )
                      } else {
                        return null
                      }
                    })}
                  </dl>
                ) : (
                  msgs &&
                  msgs.map((msg: any) => (
                    <dl key={msg.contact}>
                      {Object.entries(msg).map(([key, value]) => {
                        return (
                          <Fragment key={key}>
                            <dt>{key}</dt>
                            <dd
                              style={{
                                maxWidth: "200px",
                              }}
                            >
                              {JSON.stringify(value)}
                            </dd>
                          </Fragment>
                        )
                      })}
                    </dl>
                  ))
                )}
                <br />
                <br />
                {peerData && (
                  <button
                    type="button"
                    className={styles.button}
                    onClick={connectWallet}
                  >
                    Connect
                  </button>
                )}

                {confirm.button}
              </Form>
            )}
          </Tx>
        </Card>,
        <></>,
      ]}
    />
  )
}

export default ConfirmForm
