import { Fragment, useEffect, useState } from "react"
// import { useTranslation } from "react-i18next"
// import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"

import { AccAddress } from "@terra-money/terra.js"
import { useTnsAddress } from "data/external/tns"
import { Auto, Card } from "components/layout"
import { Form } from "components/form"
import Tx from "../Tx"
import { RN_APIS, WebViewMessage } from "utils/rnModule"
import { useNavigate } from "react-router-dom"

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
  const navigate = useNavigate()

  const [peerData, setPeerData] = useState<any>(null)
  const [tx, setTx] = useState<any>(null)
  const [msgs, setMsgs] = useState<any>(null)

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { handleSubmit } = form
  // const { formState } = form
  // const { errors } = formState

  /* resolve recipient */
  const { ...tnsState } = useTnsAddress("")

  const readyConnect = async () => {
    const res = await WebViewMessage(RN_APIS.READY_CONNECT_WALLET, {
      uri: decodeURIComponent(payload),
    })
    setPeerData(res)
  }

  useEffect(() => {
    peerData && setPeerData(null)
    if (payload) {
      setTx({
        txData: payload,
        initialGasDenom: "uluna",
        onPost() {
          console.log("onPost")
          navigate("/", { replace: true })
        },
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
            {({ confirm, connect }) => (
              <Form
                onSubmit={handleSubmit(
                  action === "wallet_connect" ? connect.fn : confirm.fn
                )}
              >
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
                      {Object.entries(msg).map(([key, value], idx) => {
                        return (
                          <Fragment key={`${key}-${idx}`}>
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
                {action === "wallet_connect" ? connect.button : confirm.button}
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
