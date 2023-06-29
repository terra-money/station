import { useDevMode, usePreconfigure } from "utils/localStorage"
import SettingsSelectorToggle from "components/layout/SettingsSelectorToggle"
import { FlexColumn, GasAdjustment } from "components/layout"
import { TooltipIcon } from "components/display"
import { DevModeTooltip } from "./DevModeTooltips"

const AdvancedSettings = () => {
  const { devMode, changeDevMode } = useDevMode()
  const { preconfigure, changePreconfigure } = usePreconfigure()
  const dmoptions = [
    { value: "devMode", selected: devMode, label: "Developer Mode" },
  ]
  const pcoptions = [
    {
      value: "preconfigure",
      selected: preconfigure,
      label: "Preconfigured accounts",
    },
  ]

  return (
    <FlexColumn gap={10}>
      <SettingsSelectorToggle
        onChange={changeDevMode}
        extra={<TooltipIcon content={<DevModeTooltip />} />}
        options={dmoptions}
      />
      <SettingsSelectorToggle
        onChange={changePreconfigure}
        options={pcoptions}
      />
      <GasAdjustment />
    </FlexColumn>
  )
}

export default AdvancedSettings
