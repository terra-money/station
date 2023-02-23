import { useTranslation } from "react-i18next"
import { RenderButton } from "types/components"
import { useAddress } from "data/wallet"
import { Grid } from "components/layout"
import { ModalButton } from "components/feedback"
import QRCode from "auth/components/QRCode"

const WalletQR = ({ renderButton }: { renderButton: RenderButton }) => {
  const { t } = useTranslation()
  const address = useAddress()

  if (!address) return null

  return (
    <ModalButton title={t("Wallet address")} renderButton={renderButton}>
      <Grid gap={20}>
        <QRCode value={address} />
        <p className="small center">{address}</p>
      </Grid>
    </ModalButton>
  )
}

export default WalletQR
