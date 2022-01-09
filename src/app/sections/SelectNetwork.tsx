import SettingsIcon from "@mui/icons-material/Settings"
import { useNetworkOptions, useNetworkState } from "data/wallet"
import { RadioGroup } from "components/form"
import { Popover } from "components/display"
import HeaderIconButton from "../components/HeaderIconButton"

const SelectNetwork = () => {
  const [network, setNetwork] = useNetworkState()
  const networkOptions = useNetworkOptions()

  if (!networkOptions) return null

  return (
    <Popover
      content={
        <RadioGroup
          options={networkOptions}
          value={network}
          onChange={setNetwork}
          reversed
        />
      }
      placement="bottom"
    >
      <HeaderIconButton>
        <SettingsIcon style={{ fontSize: 18 }} />
      </HeaderIconButton>
    </Popover>
  )
}

export default SelectNetwork
