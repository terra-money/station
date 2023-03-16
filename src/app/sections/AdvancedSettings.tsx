import { useDevMode } from "utils/localStorage"
import SettingsSelectorToggle from "components/layout/SettingsSelectorToggle"
import { FlexColumn, GasAdjustment } from "components/layout"
import { TooltipIcon } from "components/display"
import DevModeTooltip from "./DevModeTooltip"

const AdvancedSettings = () => {
  const { devMode, changeDevMode } = useDevMode()
  const options = [{ value: "devMode", selected: devMode, label: "Dev Mode" }]

  return (
    <FlexColumn gap={10}>
      <SettingsSelectorToggle
        onChange={changeDevMode}
        extra={<TooltipIcon content={<DevModeTooltip />} placement="bottom" />}
        options={options}
      />
      <GasAdjustment />
    </FlexColumn>
  )
}

export default AdvancedSettings
