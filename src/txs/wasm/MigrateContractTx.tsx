import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { Page, Card } from "components/layout"
import MigrateContractForm from "./MigrateContractForm"

const MigrateContractTx = () => {
  const { t } = useTranslation()
  const { contract } = useParams()

  if (!contract) throw new Error("Contract is not defined")

  return (
    <Page title={t("Migrate")} small>
      <Card>
        <MigrateContractForm contract={contract} />
      </Card>
    </Page>
  )
}

export default MigrateContractTx
