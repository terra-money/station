import { useTranslation } from "react-i18next"
import { RenderButton } from "types/components"
import { ModalButton } from "components/feedback"
import ManageCustomTokens from "../custom/ManageCustomTokens"

interface Props {
  children: RenderButton
}

const AddTokens = ({ children: renderButton }: Props) => {
  const { t } = useTranslation()

  return (
    <ModalButton title={t("Manage list")} renderButton={renderButton}>
      <ManageCustomTokens />
    </ModalButton>
  )
}

export default AddTokens
