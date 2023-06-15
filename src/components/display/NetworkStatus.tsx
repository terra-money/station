import WarningIcon from "@mui/icons-material/Warning"
import { useNetworks } from "app/InitNetworks"
import { useNetworkName } from "data/wallet"
import { useTranslation } from "react-i18next"
import { Tooltip } from "components/display"
import HeaderIconButton from "app/components/HeaderIconButton"

const NetworkStatus = () => {
  const { filterDisabledNetworks, networks, networksLoading } = useNetworks()
  const networkName = useNetworkName()
  const disabledNetworks = filterDisabledNetworks(networks[networkName])
  const disabled = Object.values(disabledNetworks ?? {})

  if (!disabled.length || networksLoading) return null

  const NetworkDisabledTooltip = () => {
    const { t } = useTranslation()
    return (
      <article>
        <h1>{t("Temporarily disabled networks")}</h1>
        <ul>
          {disabled.map(({ name }) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </article>
    )
  }

  return (
    <HeaderIconButton>
      <Tooltip content={<NetworkDisabledTooltip />}>
        <WarningIcon color="warning" style={{ fontSize: 18 }} />
      </Tooltip>
    </HeaderIconButton>
  )
}

export default NetworkStatus
