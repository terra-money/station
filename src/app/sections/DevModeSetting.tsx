import { useDevMode } from "utils/localStorage"
import SettingsSelectorToggle from "components/layout/SettingsSelectorToggle"

const DevModeSetting = () => {
  const { devMode, changeDevMode } = useDevMode()
  const options = [{ value: "devMode", selected: devMode, label: "Dev Mode" }]

  return <SettingsSelectorToggle onChange={changeDevMode} options={options} />
}

export default DevModeSetting
