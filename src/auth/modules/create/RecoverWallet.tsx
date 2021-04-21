import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import CreateWalletWizard from "./CreateWalletWizard"
import SelectAddress from "./SelectAddress"

const RecoverWallet = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Recover wallet")} small>
      <Card>
        <CreateWalletWizard beforeCreate={<SelectAddress />} />
      </Card>
    </Page>
  )
}

export default RecoverWallet
