import { useNetworkOptions, useNetworkState } from "data/wallet"
import SettingsSelector from "components/layout/SettingsSelector"

const NetworkSetting = () => {
  const [network, setNetwork] = useNetworkState()
  const networkOptions = useNetworkOptions()

  if (!networkOptions) return null

  return (
    <SettingsSelector
      options={networkOptions}
      value={network}
      onChange={setNetwork}
    />
  )
}

export default NetworkSetting
