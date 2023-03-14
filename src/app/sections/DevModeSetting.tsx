import { useDevMode } from "utils/localStorage"
import SettingsSelectorToggle from "components/layout/SettingsSelectorToggle"
import { FlexColumn, GasAdjustment } from "components/layout"

const DevModeSetting = () => {
  const { devMode, changeDevMode } = useDevMode()
  const options = [{ value: "devMode", selected: devMode, label: "Dev Mode" }]

  return (
    <FlexColumn gap={10}>
      <SettingsSelectorToggle onChange={changeDevMode} options={options} />
      <GasAdjustment />
    </FlexColumn>
  )
}

export default DevModeSetting
