import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"

import { AccAddress, CreateTxOptions } from "@terra-money/terra.js"
import { useTnsAddress } from "data/external/tns"
import { Card, Flex, Grid } from "components/layout"
import { Form } from "components/form"
import Tx from "../Tx"
import {
  parseDefault,
  parseTx,
  RN_APIS,
  TxRequest,
  WebViewMessage,
} from "utils/rnModule"
import { useNavigate } from "react-router-dom"
import GridConfirm from "../../components/layout/GridConfirm"
import styles from "./Confirm.module.scss"
import TxDetails from "./components/TxDetails"
import { getStoredSessions } from "../../auth/scripts/sessions"

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
  const navigate = useNavigate()
  const connectors = getStoredSessions()

  const [txProps, setTxProps] = useState<any>(null)
  const [tx, setTx] = useState<TxRequest>()

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { handleSubmit } = form

  /* resolve recipient */
  const { ...tnsState } = useTnsAddress("")

  useEffect(() => {
    if (payload) {
      const parsedTx = parseTx(payload.params)

      const origin =
        (connectors?.[payload.handshakeTopic].peerMeta.url as string) || ""

      const txData: TxRequest = {
        ...parseDefault(payload),
        origin,
        tx: parsedTx,
        requestType: "post",
      }

      setTx(txData)

      setTxProps({
        confirmData: txData,
        onPost() {
          navigate("/", { replace: true })
        },
      })
    }
  }, [action, payload])

  return (
    <Card isFetching={tnsState.isLoading} className="blank">
      <Tx {...txProps}>
        {({ confirm }) => (
          <Form onSubmit={handleSubmit(confirm.fn)}>
            <GridConfirm button={confirm.button} className={styles.container}>
              {tx && <TxDetails {...tx} />}
            </GridConfirm>
          </Form>
        )}
      </Tx>
    </Card>
  )
}

export default ConfirmForm
