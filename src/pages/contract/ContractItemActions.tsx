import { useTranslation } from "react-i18next"
import { Button, LinkButton } from "components/general"
import { ModalButton } from "components/feedback"
import { ExtraActions } from "components/layout"
import ContractQuery from "./ContractQuery"
import { useContract } from "./Contract"

const ContractItemActions = () => {
  const { t } = useTranslation()
  const address = useContract()

  return (
    <ExtraActions>
      <ModalButton
        title={t("Query")}
        renderButton={(open) => (
          <Button onClick={open} size="small" outline>
            {t("Query")}
          </Button>
        )}
      >
        <ContractQuery />
      </ModalButton>

      <LinkButton to={`/contract/execute/${address}`} size="small" outline>
        {t("Execute")}
      </LinkButton>
    </ExtraActions>
  )
}

export default ContractItemActions
