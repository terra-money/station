import { useEffect, useState } from "react"
import { SettingKey } from "utils/localStorage"
import { getLocalSetting, setLocalSetting } from "utils/localStorage"
import { FormItem, Input } from "components/form"

const GasAdjustment = () => {
  const [input, setInput] = useState(
    String(getLocalSetting(SettingKey.GasAdjustment))
  )

  useEffect(() => {
    const value = Number(input)
    if (value) setLocalSetting(SettingKey.GasAdjustment, value)
  }, [input])

  return (
    <FormItem style={{ width: "100%" }} label="Gas adjustment">
      <Input value={input} onChange={(e) => setInput(e.target.value)} />
    </FormItem>
  )
}

export default GasAdjustment
