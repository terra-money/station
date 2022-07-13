import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Page } from "components/layout"
import TxContext from "../TxContext"
import ConnectForm from "./ConnectForm"
import styles from "./Connect.module.scss"
import { toast } from "react-toastify"
import { useAuth } from "auth"

const ConnectTx = () => {
  const { state }: { state: any } = useLocation()
  const [action, setAction] = useState<string>("")
  const { wallet } = useAuth()
  const navigate = useNavigate()

  const parsedPayload = useMemo(() => {
    const { action, payload } = state
    setAction(action)
    return payload
  }, [state])

  useEffect(() => {
    if (!wallet) {
      navigate("/wallet", { replace: true })
      toast.error("No connected wallet", { toastId: "wallet-error" })
    }
  }, [wallet, navigate])

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
