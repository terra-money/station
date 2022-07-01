import { useEffect, useMemo, useState } from "react"
import { useRecoilState } from "recoil"
import { useLocation } from "react-router-dom"
import { Page } from "components/layout"
import TxContext from "../TxContext"
import ConfirmForm from "./ConfirmForm"
import { fromBase64 } from "utils/data"
import { latestTxState } from "../../data/queries/tx"

const ConfirmTx = () => {
  const { state }: { state: any } = useLocation()
  const [latestTx, setLatestTx] = useRecoilState(latestTxState)
  const { txhash } = latestTx

  const [action, setAction] = useState<string>("")

  const parsedPayload = useMemo(() => {
    const { action, payload } = state

    setAction(action)
    if (payload) {
      const payloadObjects = fromBase64(payload)
      return JSON.parse(payloadObjects)
    }
  }, [state])

  useEffect(() => {
    if (txhash) {
      setLatestTx({ txhash: "" })
    }
  }, [])

  return (
    <Page className="hideMenu">
      <TxContext>
        {parsedPayload && (
          <ConfirmForm action={action} payload={parsedPayload} />
        )}
      </TxContext>
    </Page>
  )
}

export default ConfirmTx
