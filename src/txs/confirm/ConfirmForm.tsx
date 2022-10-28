import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import { AccAddress } from "@terra-money/terra.js"
import { useTnsAddress } from "data/external/tns"
import { Card } from "components/layout"
import { Form } from "components/form"
import Tx from "../Tx"
import { parseDefault, parseTx, TxRequest } from "utils/rnModule"
import { useNavigate } from "react-router-dom"
import GridConfirm from "../../components/layout/GridConfirm"
import styles from "./Confirm.module.scss"
import TxDetails from "./components/TxDetails"
import { useIsClassic } from "data/query"
import { useSessionsState } from "../../auth/hooks/useSessions"

interface TxValues {
  recipient?: string
  address?: AccAddress
  input?: number
  memo?: string
}

interface Props {
  action: any
  payload: any
}

const ConfirmForm = ({ action, payload }: Props) => {
  const navigate = useNavigate()
  const isClassic = useIsClassic()
  const [sessions] = useSessionsState()

  const [txProps, setTxProps] = useState<any>(null)
  const [tx, setTx] = useState<TxRequest>()

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { handleSubmit } = form

  /* resolve recipient */
  const { ...tnsState } = useTnsAddress("")

  useEffect(() => {
    if (payload) {
      if (payload?.method === "signBytes") {
        setTxProps({
          confirmData: {
            ...parseDefault(payload),
            requestType: payload?.method,
            bytes: payload.params,
          },
          onPost() {
            navigate("/wallet", { replace: true })
          },
        })
      } else {
        const parsedTx = parseTx(payload.params, isClassic)

        const origin =
          (sessions?.[payload.handshakeTopic].peerMeta.url as string) || ""

        const txData: TxRequest = {
          ...parseDefault(payload),
          requestType: payload?.method,
          origin,
          tx: parsedTx,
        }

        setTx(txData)

        setTxProps({
          confirmData: txData,
          onPost() {
            navigate("/wallet", { replace: true })
          },
        })
      }
    }
  }, [action, payload, sessions, isClassic, navigate])

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
