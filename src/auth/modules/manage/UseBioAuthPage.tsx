import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import GoBack from "./GoBack"
import UseBioAuthForm from "./UseBioAuthForm"

const UseBioAuthPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Use Bio Auth")} extra={<GoBack />}>
      <Card>
        <UseBioAuthForm />
      </Card>
    </Page>
  )
}

export default UseBioAuthPage
