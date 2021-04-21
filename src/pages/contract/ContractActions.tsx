import { useTranslation } from "react-i18next"
import { LinkButton } from "components/general"
import { ExtraActions } from "components/layout"

const ContractActions = () => {
  const { t } = useTranslation()

  return (
    <ExtraActions>
      <LinkButton to="/contract/store" color="primary" size="small">
        {t("Upload")}
      </LinkButton>

      <LinkButton to="/contract/instantiate" color="primary" size="small">
        {t("Instantiate")}
      </LinkButton>
    </ExtraActions>
  )
}

export default ContractActions
