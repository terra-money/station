import { useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { Page } from "components/layout"
import TxContext from "../TxContext"
import ConnectForm from "./ConnectForm"
import styles from "./Connect.module.scss"

const ConnectTx = () => {
  const { state }: { state: any } = useLocation()
  const [action, setAction] = useState<string>("")

  const parsedPayload = useMemo(() => {
    const { action, payload } = state
    setAction(action)
    return payload
  }, [state])

  return (
    <Page className={styles.page}>
      <TxContext>
        {parsedPayload && (
          <ConnectForm action={action} payload={parsedPayload} />
        )}
      </TxContext>
    </Page>
  )
}

export default ConnectTx
