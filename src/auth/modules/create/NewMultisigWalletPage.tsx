import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import NewMultisigWalletForm from "./NewMultisigWalletForm"

const NewMultisigWalletPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("New multisig wallet")} small>
      <Card>
        <NewMultisigWalletForm />
      </Card>
    </Page>
  )
}

export default NewMultisigWalletPage
