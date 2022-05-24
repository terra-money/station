import { useTranslation } from "react-i18next"
import { isEmpty } from "ramda"
import { Grid } from "components/layout"
import { Button } from "components/general"
import { ModalButton, Mode } from "components/feedback"
import { FormError } from "components/form"
import { getStoredSessions, removeSessions } from "auth/scripts/sessions"
import AssetWallet from "./AssetWallet"
import { ReactComponent as WalletConnectIcon } from "styles/images/menu/Walletconnect.svg"
import styles from "./WalletConnect.module.scss"
import is from "auth/scripts/is"
import GridConfirm from "../../components/layout/GridConfirm"

const Selector = () => {
  const connectors = getStoredSessions()
  const { t } = useTranslation()

  return (
    <Grid gap={20}>
      {connectors && !isEmpty(connectors) ? (
        Object.values(connectors).map((value: any) => {
          if (!isEmpty(value?.peerMeta)) return
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
  const connectors = getStoredSessions()

  return connectors && !isEmpty(connectors) ? (
    <ModalButton
      title={t("Wallet connect")}
      modalType={is.mobile() ? Mode.FULL : Mode.DEFAULT}
      renderButton={(open) => (
        <button onClick={open} className={styles.fab}>
          <WalletConnectIcon {...{ width: 24, height: 24 }} />
        </button>
      )}
    >
      <GridConfirm
        button={
          <ModalButton
            modalType={is.mobile() ? Mode.BOTTOM : Mode.DEFAULT}
            renderButton={(open) => (
              <Button block color="danger" onClick={open}>
                {t("Disconnect all sessions")}
              </Button>
            )}
            maxHeight={false}
            cancelButton={{
              name: t("Cancel"),
              type: "default",
            }}
          >
            <Button
              block
              color="danger"
              onClick={async () => {
                await removeSessions()
              }}
            >
              {t("Disconnect all sessions")}
            </Button>
          </ModalButton>
        }
      >
        <Selector />
      </GridConfirm>
    </ModalButton>
  ) : (
    <></>
  )
}

export default WalletConnect
