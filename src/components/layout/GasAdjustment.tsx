import { useEffect, useState } from "react"
import { SettingKey } from "utils/localStorage"
import { getLocalSetting, setLocalSetting } from "utils/localStorage"
import { FormItem, Input } from "components/form"
import { useDevMode } from "utils/localStorage"
import { DEFAULT_GAS_ADJUSTMENT } from "config/constants"

const GasAdjustment = ({ extra }: { extra?: React.ReactNode }) => {
  const { devMode } = useDevMode()
  const [input, setInput] = useState(
    String(getLocalSetting(SettingKey.GasAdjustment))
  )

  useEffect(() => {
    if (!devMode) {
      setLocalSetting(SettingKey.GasAdjustment, DEFAULT_GAS_ADJUSTMENT)
      setInput(String(DEFAULT_GAS_ADJUSTMENT))
    }
    const value = Number(input)
    if (value) setLocalSetting(SettingKey.GasAdjustment, value)
  }, [input, devMode])

  return (
    <FormItem style={{ width: "100%" }} label={<>Gas Adjustment {extra}</>}>
      <Input
        disabled={!devMode}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </FormItem>
  )
}

export default GasAdjustment
