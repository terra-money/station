import { Fragment, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
// import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"

import { AccAddress } from "@terra-money/terra.js"
import { useTnsAddress } from "data/external/tns"
import { Auto, Card, Flex, Grid } from "components/layout"
import { Form } from "components/form"
import Tx from "../Tx"
import { RN_APIS, WebViewMessage } from "utils/rnModule"
import { useNavigate } from "react-router-dom"
import styles from "../connect/Connect.module.scss"
import { ReactComponent as WalletConnectIcon } from "../../styles/images/menu/Walletconnect.svg"
import GridConfirm from "../../components/layout/GridConfirm"

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
    <Tx {...tx}>
      {({ confirm }) => (
        <Form onSubmit={handleSubmit(confirm.fn)}>
          {msgs && (
            <GridConfirm button={confirm.button} className={styles.connect}>
              <Grid>
                <Flex>confirm</Flex>
                <Card className={styles.detail} isFetching={tnsState.isLoading}>
                  <Grid gap={16}>
                    {msgs.map((msg: any) => (
                      <div key={msg.contact}>
                        {Object.entries(msg).map(([key, value], idx) => {
                          return (
                            <div key={`${key}-${idx}`}>
                              <h2>{key}</h2>
                              <p>{JSON.stringify(value)}</p>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </Grid>
                </Card>
              </Grid>
            </GridConfirm>
          )}
        </Form>
      )}
    </Tx>
  )
}

export default ConfirmForm
