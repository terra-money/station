import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { ModalButton } from "components/feedback"
import ManageCustomTokens from "../custom/ManageCustomTokens"

interface Props {
  children: (open: () => void) => ReactNode
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
