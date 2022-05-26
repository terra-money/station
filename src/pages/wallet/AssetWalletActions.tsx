import { useTranslation } from "react-i18next"
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined"
import { InternalButton, Button } from "components/general"
import { ExtraActions } from "components/layout"
import { ModalButton, useModal } from "components/feedback"
import { Props } from "./AssetWallet"
import { disconnectSession } from "../../auth/scripts/sessions"

const AssetWalletActions = ({ handshakeTopic, peerMeta: { name } }: Props) => {
  const { t } = useTranslation()
  const close = useModal()

  return (
    <ExtraActions>
      <ModalButton
        title={t("Disconnect {{name}}", { name })}
        renderButton={(open) => (
          <InternalButton
            icon={<BlockOutlinedIcon style={{ fontSize: 18 }} />}
            onClick={open}
          >
            {t("Disconnect")}
          </InternalButton>
        )}
        maxHeight={false}
      >
        <Button
          block
          color="primary"
          onClick={async () => {
            try {
              await disconnectSession(handshakeTopic)
              close()
            } catch (error) {
              console.log(error)
            }
          }}
        >
          {t("Disconnect")}
        </Button>
      </ModalButton>
    </ExtraActions>
  )
}

export default AssetWalletActions
