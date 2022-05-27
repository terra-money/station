import { useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { Page } from "components/layout"
import TxContext from "../TxContext"
import ConfirmForm from "./ConfirmForm"
import { fromBase64 } from "utils/data"

const ConfirmTx = () => {
  const { state }: { state: any } = useLocation()
  const [action, setAction] = useState<string>("")

  const parsedPayload = useMemo(() => {
    const { action, payload } = state

    setAction(action)
    if (payload) {
      const payloadObjects = fromBase64(payload)
      return JSON.parse(payloadObjects)
    }
  }, [state])

  return (
    <Page>
      <TxContext>
        {parsedPayload && (
          <ConfirmForm action={action} payload={parsedPayload} />
        )}
      </TxContext>
    </Page>
  )
}

export default ConfirmTx
