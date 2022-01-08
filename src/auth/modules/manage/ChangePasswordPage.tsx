import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import ConnectedWallet from "./ConnectedWallet"
import GoBack from "./GoBack"
import ChangePasswordForm from "./ChangePasswordForm"

const ChangePasswordPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Change password")} extra={<GoBack />}>
      <ConnectedWallet>
        <Card>
          <ChangePasswordForm />
        </Card>
      </ConnectedWallet>
    </Page>
  )
}

export default ChangePasswordPage
