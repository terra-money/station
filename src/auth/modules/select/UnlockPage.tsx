import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import UnlockForm from "./UnlockForm"

const UnlockPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Unlock wallet")} small>
      <Card>
        <UnlockForm />
      </Card>
    </Page>
  )
}

export default UnlockPage
