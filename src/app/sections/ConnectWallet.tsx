import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { ConnectType, useWallet } from "@terra-money/wallet-provider"
import { useAddress } from "data/wallet"
import { Button } from "components/general"
import { Grid } from "components/layout"
import { List } from "components/display"
import { ModalButton } from "components/feedback"
import { useAuth } from "auth"
import SwitchWallet from "auth/modules/select/SwitchWallet"
import Connected from "./Connected"

interface Props {
  renderButton?: (open: () => void) => ReactNode
}

const ConnectWallet = ({ renderButton }: Props) => {
  const { t } = useTranslation()

  const { connect, install, availableConnections, availableInstallTypes } =
    useWallet()

  const { available } = useAuth()

  const address = useAddress()
  if (address) return <Connected />

  const defaultRenderButton: Props["renderButton"] = (open) => (
    <Button onClick={open} size="small" outline>
      {t("Connect")}
    </Button>
  )

  const list = [
    ...availableConnections.map(({ type, identifier, name, icon }) => ({
      src: icon,
      children: type === ConnectType.EXTENSION ? t("Extension") : name,
      onClick: () => connect(type, identifier),
    })),
    ...availableInstallTypes
      .filter((type) => type === ConnectType.EXTENSION)
      .map((type) => ({
        children: t("Install extension"),
        onClick: () => install(type),
      })),
  ]

  return (
    <ModalButton
      title={t("Connect wallet")}
      renderButton={renderButton ?? defaultRenderButton}
    >
      <Grid gap={20}>
        <SwitchWallet />
        <List list={available.length ? available : list} />
      </Grid>
    </ModalButton>
  )
}

export default ConnectWallet
