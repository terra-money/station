import { useTranslation } from "react-i18next"
import { isEmpty } from "ramda"
import { Grid } from "components/layout"
import { ModalButton, Mode } from "components/feedback"
import { FormError } from "components/form"
import { getStoredSessions } from "../../auth/scripts/sessions"
import AssetWallet from "./AssetWallet"
import { ReactComponent as WalletConnectIcon } from "styles/images/menu/Walletconnect.svg"
import styles from "./WalletConnect.module.scss"
import { useEffect, useState } from "react"
import is from "../../auth/scripts/is"

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
  const connectors = getStoredSessions()

  return connectors && !isEmpty(connectors) ? (
    <ModalButton
      title={t("WalletConnect")}
      modalType={is.mobile() ? Mode.FULL : Mode.DEFAULT}
      renderButton={(open) => (
        <button onClick={open} className={styles.fab}>
          <WalletConnectIcon {...{ width: 24, height: 24 }} />
        </button>
      )}
    >
      <Grid gap={20}>
        <Selector />
      </Grid>
    </ModalButton>
  ) : (
    <></>
  )
}

export default WalletConnect
