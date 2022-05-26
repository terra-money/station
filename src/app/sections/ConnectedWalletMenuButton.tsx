import { ModalButton, Mode } from "components/feedback"
import { RenderButton } from "types/components"
import { ManageConnected } from "auth/modules/manage/MobileManageWallets"
import styles from "./MobileItem.module.scss"
import { ReactComponent as WalletIcon } from "styles/images/menu/WalletSetting.svg"

interface Props {
  renderButton?: RenderButton
}

const ConnectedWalletMenuButton = () => {
  const defaultRenderButton: Props["renderButton"] = (open) => (
    <div onClick={open} className={styles.wallet}>
      <WalletIcon />
    </div>
  )

  return (
    <ModalButton
      renderButton={defaultRenderButton}
      modalType={Mode.BOTTOM}
      maxHeight
    >
      <ManageConnected />
    </ModalButton>
  )
}

export default ConnectedWalletMenuButton
