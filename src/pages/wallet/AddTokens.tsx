import { useTranslation } from "react-i18next"
import { RenderButton } from "types/components"
import { ModalButton, Mode } from "components/feedback"
import ManageCustomTokens from "../custom/ManageCustomTokens"
import is from "auth/scripts/is"

interface Props {
  children: RenderButton
}

const AddTokens = ({ children: renderButton }: Props) => {
  const { t } = useTranslation()

  return (
    <ModalButton
      title={t("Manage list")}
      renderButton={renderButton}
      modalType={is.mobile() ? Mode.FULL : Mode.DEFAULT}
    >
      <ManageCustomTokens />
    </ModalButton>
  )
}

export default AddTokens
