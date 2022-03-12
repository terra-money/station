import { useTranslation } from "react-i18next"
import QrCodeIcon from "@mui/icons-material/QrCode"
import { useAddress } from "data/wallet"
import { ModalButton } from "components/feedback"
import QRCode from "auth/components/QRCode"
import { Grid } from "components/layout"
import styles from "./WalletQR.module.scss"

const WalletQR = () => {
  const { t } = useTranslation()
  const address = useAddress()

  if (!address) return null

  return (
    <ModalButton
      title={t("Wallet address")}
      renderButton={(open) => (
        <button onClick={open} className={styles.button}>
          <QrCodeIcon fontSize="inherit" />
        </button>
      )}
    >
      <Grid gap={20}>
        <QRCode value={address} />
        <p className="small center">{address}</p>
      </Grid>
    </ModalButton>
  )
}

export default WalletQR
