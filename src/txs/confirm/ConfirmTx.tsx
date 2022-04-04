import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { AccAddress } from "@terra-money/terra.js"
import { getAmount } from "utils/coin"
import { useTokenBalance } from "data/queries/wasm"
import { useBankBalance } from "data/queries/bank"
import { useTokenItem } from "data/token"
import { Page } from "components/layout"
import TxContext from "../TxContext"
import ConfirmForm from "./ConfirmForm"

import { fromBase64 } from "utils/data"

const ConfirmTx = () => {
  const { t } = useTranslation()
  const { state }: { state: any } = useLocation()
  const [action, setAction] = useState<string>("")

  const parsedPayload = useMemo(() => {
    const { action, payload } = state
    setAction(action)
    if (payload) {
      if (action === "wallet_connect") {
        return payload
      } else {
        const payloadObjects = fromBase64(payload)
        return JSON.parse(payloadObjects)
      }
    }
  }, [state])

  return (
    <Page title={t("Confirm")}>
      <TxContext>
        {parsedPayload && (
          <ConfirmForm action={action} payload={parsedPayload} />
        )}
      </TxContext>
    </Page>
  )
}

export default ConfirmTx
