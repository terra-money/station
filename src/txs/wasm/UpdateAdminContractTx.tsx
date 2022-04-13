import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { Page, Card } from "components/layout"
import TxContext from "../TxContext"
import UpdateAdminContractForm from "./UpdateAdminContractForm"

const MigrateContractTx = () => {
  const { t } = useTranslation()
  const { contract } = useParams()

  if (!contract) throw new Error("Contract is not defined")

  return (
    <Page title={t("UpdateAdmin")} small>
      <Card>
        <TxContext>
          <UpdateAdminContractForm contract={contract} />
        </TxContext>
      </Card>
    </Page>
  )
}

export default MigrateContractTx
