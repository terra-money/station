import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"

import { AccAddress } from "@terra-money/terra.js"
import { Card, Flex, FlexColumn, Grid } from "components/layout"
import { Form } from "components/form"
import Tx from "../Tx"
import { RN_APIS, WebViewMessage } from "utils/rnModule"
import { useNavigate } from "react-router-dom"
import GridConfirm from "components/layout/GridConfirm"
import styles from "./Connect.module.scss"
import { ReactComponent as WalletConnectIcon } from "styles/images/menu/Walletconnect.svg"
import { LoadingCircular } from "../../components/feedback"

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

const ConnectForm = ({ action, payload }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [peerData, setPeerData] = useState<any>(null)
  const [tx, setTx] = useState<any>(null)

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { handleSubmit } = form

  const readyConnect = async () => {
    try {
      const res = await WebViewMessage(RN_APIS.READY_CONNECT_WALLET, {
        uri: decodeURIComponent(payload),
      })

      setPeerData(res)
    } catch (error) {
      console.error("readyConnect", error)
    }
  }

  useEffect(() => {
    peerData && setPeerData(null)
    if (payload) {
      setTx({
        onPost() {
          navigate("/", { replace: true })
        },
      })

      readyConnect()
    }
  }, [action, payload])

  if (!peerData) {
    return (
      <FlexColumn gap={20} className={styles.screen}>
        <LoadingCircular size={36} />
        <p>Ready to Connect</p>
      </FlexColumn>
    )
  }

  return (
    <Tx {...tx}>
      {({ connect }) => (
        <Form onSubmit={handleSubmit(connect.fn)}>
          {peerData && (
            <GridConfirm button={connect.button} className={styles.connect}>
              <Grid>
                <Flex>
                  <WalletConnectIcon />
                </Flex>
                <Flex>
                  <h1>{peerData.name} request to connect your wallet</h1>
                </Flex>
                <Card className={styles.detail}>
                  <Grid gap={16}>
                    <div>
                      <h2>{t("Connect")}</h2>
                      <p>{peerData.url}</p>
                    </div>
                    <div>
                      <h2>{t("Description")}</h2>
                      <p>{peerData.description}</p>
                    </div>
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

export default ConnectForm
