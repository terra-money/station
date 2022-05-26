import { useTranslation } from "react-i18next"
import { ModalButton, Mode } from "components/feedback"
import { RenderButton } from "types/components"
import { ManageConnecting } from "auth/modules/manage/MobileManageWallets"
import styles from "./MobileItem.module.scss"
import { ReactComponent as PlusIcon } from "styles/images/icons/Plus.svg"

interface Props {
  renderButton?: RenderButton
}

const WalletMenuButton = () => {
  const { t } = useTranslation()

  const defaultRenderButton: Props["renderButton"] = (open) => (
    <div onClick={open} className={styles.item}>
      <PlusIcon />
      {t("Add a wallet")}
    </div>
  )

  return (
    <ModalButton
      renderButton={defaultRenderButton}
      modalType={Mode.BOTTOM}
      maxHeight
    >
      <ManageConnecting />
    </ModalButton>
  )
}

export default WalletMenuButton
