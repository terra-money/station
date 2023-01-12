import { useTranslation } from "react-i18next"
import { useAddress, useChainID } from "data/wallet"
import { useValidators } from "data/queries/staking"
import { getConnectedMoniker } from "data/queries/distribution"
import { Page, Card } from "components/layout"
import { Wrong } from "components/feedback"
import WithdrawCommissionForm from "./WithdrawCommissionForm"

const WithdrawCommissionTx = () => {
  const { t } = useTranslation()
  const address = useAddress()
  const chainID = useChainID()
  const { data: validators, ...state } = useValidators(chainID)
  const moniker = getConnectedMoniker(address, validators)

  const render = () => {
    if (!validators) return null
    if (!moniker) return <Wrong>{t("Validator account not connected")}</Wrong>

    return <WithdrawCommissionForm />
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
