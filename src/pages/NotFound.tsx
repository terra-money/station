import { useTranslation } from "react-i18next"
import { Page, Card } from "components/layout"
import { Wrong } from "components/feedback"

const NotFound = () => {
  const { t } = useTranslation()
  return (
    <Page title="404">
      <Card>
        <Wrong>{t("Not found")}</Wrong>
      </Card>
    </Page>
  )
}

export default NotFound
