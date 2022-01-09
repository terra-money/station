import { Card, Page } from "components/layout"
import { useTranslation } from "react-i18next"
import AddNetworkForm from "./AddNetworkForm"

const AddNetworkPage = () => {
  const { t } = useTranslation()
  return (
    <Page title={t("Add a network")} small>
      <Card>
        <AddNetworkForm />
      </Card>
    </Page>
  )
}

export default AddNetworkPage
