import { useNetworkOptions, useNetworkState } from "data/wallet"
import { RadioGroup } from "components/form"

const NetworkSetting = () => {
  const [network, setNetwork] = useNetworkState()
  const networkOptions = useNetworkOptions()

  if (!networkOptions) return null

  return (
    <RadioGroup
      options={networkOptions}
      value={network}
      onChange={setNetwork}
    />
  )
}

export default NetworkSetting
