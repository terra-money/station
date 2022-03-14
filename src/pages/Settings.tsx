import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { SettingKey } from "utils/localStorage"
import { getLocalSetting, setLocalSetting } from "utils/localStorage"
import { Card, Page } from "components/layout"
import { FormItem, Input } from "components/form"

const Settings = () => {
  const { t } = useTranslation()
  const [input, setInput] = useState(
    String(getLocalSetting(SettingKey.GasAdjustment))
  )

  useEffect(() => {
    const value = Number(input)
    if (value) setLocalSetting(SettingKey.GasAdjustment, value)
  }, [input])

  return (
    <Page title={t("Settings")} small>
      <Card>
        <FormItem label="Gas adjustment">
          <Input value={input} onChange={(e) => setInput(e.target.value)} />
        </FormItem>
      </Card>
    </Page>
  )
}

export default Settings
