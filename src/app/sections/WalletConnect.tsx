import { useTranslation } from "react-i18next"
import classNames from "classnames/bind"
import LockIcon from "@mui/icons-material/Lock"
import { capitalize } from "@mui/material"
import { readAmount } from "@terra.kitchen/utils"
import { themes } from "styles/themes/themes"
import { useAddress } from "data/wallet"
import { useThemeState, useValidateTheme } from "data/settings/Theme"
import { Flex, FlexColumn, Grid } from "components/layout"
import { Radio } from "components/form"
import { ModalButton } from "components/feedback"
import HeaderIconButton from "../components/HeaderIconButton"
import styles from "./SelectTheme.module.scss"
import WalletConnectIcon from "styles/images/walletconnect_blue.png"
import { getStoredSessions } from "../../auth/scripts/sessions"

const cx = classNames.bind(styles)

const Selector = () => {
  const { t } = useTranslation()
  const address = useAddress()
  const connectors = getStoredSessions()

  console.log(connectors)
  return (
    <Grid gap={28} columns={2}>
      {connectors &&
        Object.entries(connectors).map(([key, value]: [string, any]) => {
          return (
            <Radio
              checked={true}
              label={capitalize(value?.peerMeta.name)}
              onClick={() => {}}
              // disabled={!unlocked}
              key={key}
            >
              <div className={styles.wrapper}>
                <Flex className={styles.preview}>{value?.peerMeta.name}</Flex>
              </div>
            </Radio>
          )
        })}
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
