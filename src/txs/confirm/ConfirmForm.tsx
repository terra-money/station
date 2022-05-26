import { Fragment, useCallback, useEffect, useState } from "react"
// import { useTranslation } from "react-i18next"
// import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"

import { AccAddress } from "@terra-money/terra.js"
import { useAddress, useChainID } from "data/wallet"
import { useTnsAddress } from "data/external/tns"
import { Auto, Card } from "components/layout"
import { Form } from "components/form"
import Tx from "../Tx"
import { RN_APIS, WebViewMessage } from "../../utils/rnModule"
import styles from "../../components/form/Form.module.scss"
import {
  getStoredSessions,
  connectorsState,
  storeSessions,
} from "../../auth/scripts/sessions"
import { useRecoilState } from "recoil"

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
  // const { t } = useTranslation()
  // const navigate = useNavigate()
  const connectedAddress = useAddress()
  const chainID = useChainID()
  const [connectors, setConnectors] = useRecoilState(connectorsState)

  const [peerData, setPeerData] = useState<any>(null)
  const [tx, setTx] = useState<any>(null)
  const [msgs, setMsgs] = useState<any>(null)

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { setError, handleSubmit } = form
  // const { formState } = form
  // const { errors } = formState

  /* resolve recipient */
  const { ...tnsState } = useTnsAddress("")

  // validate(tns): not found
  const invalid = ""

  // const disabled =
  //   invalid || (tnsState.isLoading && t("Searching for address..."))

  useEffect(() => {
    if (invalid) setError("recipient", { type: "invalid", message: invalid })
  }, [invalid, setError])

  const saveSession = (connector: any) => {
    // setConnectors((ori: any) => {
    //   return {
    //     ...ori,
    //     [connector?.handshakeTopic]: connector,
    //   }
    // })
    const connectors = getStoredSessions()

    const sessions = {
      ...connectors,
      [connector.handshakeTopic]: connector,
    }

    storeSessions(sessions)
  }

  const connectWallet = async () => {
    console.log(payload, chainID, connectedAddress)
    const connector = await WebViewMessage(RN_APIS.CONNECT_WALLET, {
      chainID,
      userAddress: connectedAddress,
    })
    console.log("connectWallet", JSON.stringify(connector))
    saveSession(connector)

    if (connector) {
      alert("wallet connected")
    }
    return connector
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
        // onPost: async (id: any, result: any) => {
        //   console.log('onPost', id, result)
        //   const res = await WebViewMessage(RN_APIS.APPROVE_TX, { id, result })
        //   console.log('onPost', res)
        // }
      })
      if (action === "wallet_connect") {
        readyConnect()
      } else {
        payload?.params?.msgs &&
          setMsgs(payload?.params?.msgs.map((item: string) => JSON.parse(item)))
      }
    }
  }, [action, payload])

  return (
    <Auto
      columns={[
        <Card isFetching={tnsState.isLoading}>
          <Tx {...tx}>
            {({ confirm }) => (
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
