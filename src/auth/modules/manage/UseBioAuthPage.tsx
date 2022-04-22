import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import ConnectedWallet from "./ConnectedWallet"
import GoBack from "./GoBack"
import UseBioAuthForm from "./UseBioAuthForm"

const UseBioAuthPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Use Bio Auth")} extra={<GoBack />}>
      <ConnectedWallet>
        <Card>
          <UseBioAuthForm />
        </Card>
      </ConnectedWallet>
    </Page>
  )
}

export default UseBioAuthPage
