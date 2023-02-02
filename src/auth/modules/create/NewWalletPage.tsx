import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import NewWalletForm from "./NewWalletForm"
import GoBack from "../manage/GoBack"

const NewWalletPage = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("New wallet")} extra={<GoBack />} small>
      <Card>
        <NewWalletForm />
      </Card>
    </Page>
  )
}

export default NewWalletPage
