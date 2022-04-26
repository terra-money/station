import { useTranslation } from "react-i18next"
import { isEmpty } from "ramda"
import { Grid } from "components/layout"
import { ModalButton } from "components/feedback"
import HeaderIconButton from "../components/HeaderIconButton"
import WalletConnectIcon from "styles/images/walletconnect_blue.png"
import { getStoredSessions } from "../../auth/scripts/sessions"
import AssetWallet from "../../pages/wallet/AssetWallet"
import { FormError } from "../../components/form"

const Selector = () => {
  const connectors = getStoredSessions()
  const { t } = useTranslation()

  return (
    <Grid gap={28}>
      {connectors && !isEmpty(connectors) ? (
        Object.values(connectors).map((value: any) => {
          return <AssetWallet {...value} />
        })
      ) : (
        <FormError>{t("Don't have connected sessions")}</FormError>
      )}
    </Grid>
  )
}

const WalletConnect = () => {
  const { t } = useTranslation()

  return (
    <ModalButton
      title={t("WalletConnect")}
      renderButton={(open) => (
        <HeaderIconButton onClick={open}>
          <img
            src={WalletConnectIcon}
            alt={t("wallet connect")}
            width={18}
            height={18}
          />
        </HeaderIconButton>
      )}
    >
      <Grid gap={20}>
        <Selector />
      </Grid>
    </ModalButton>
  )
}

export default WalletConnect
