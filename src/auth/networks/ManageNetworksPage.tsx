import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import AddIcon from "@mui/icons-material/Add"
import { Card, Page } from "components/layout"
import ManageNetworksForm from "./ManageNetworksForm"

const ManageNetworksPage = () => {
  const { t } = useTranslation()

  const add = (
    <Link to="/network/new">
      <AddIcon />
    </Link>
  )

  return (
    <Page title={t("Manage networks")} small>
      <Card title={t("Custom networks")} extra={add}>
        <ManageNetworksForm />
      </Card>
    </Page>
  )
}

export default ManageNetworksPage
