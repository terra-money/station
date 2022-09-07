import { useTranslation } from "react-i18next"
import { useAddress } from "data/wallet"
import { useValidators } from "data/queries/staking"
import { getConnectedMoniker } from "data/queries/distribution"
import { Page, Card } from "components/layout"
import { Wrong } from "components/feedback"
import TxContext from "../TxContext"
import WithdrawCommissionForm from "./WithdrawCommissionForm"

const WithdrawCommissionTx = () => {
  const { t } = useTranslation()
  const address = useAddress()
  const { data: validators, ...state } = useValidators()
  const moniker = getConnectedMoniker(address, validators)

  const render = () => {
    if (!validators) return null
    if (!moniker) return <Wrong>{t("Validator account not connected")}</Wrong>

    return (
      <TxContext>
        <WithdrawCommissionForm />
      </TxContext>
    )
  }

  return (
    <Page title={t("Withdraw commission")} small>
      <Card {...state} title={moniker}>
        {render()}
      </Card>
    </Page>
  )
}

export default WithdrawCommissionTx
