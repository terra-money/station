import { useTranslation } from "react-i18next"
import { useNetworkOptions, useNetworkState } from "data/wallet"
import { useCustomNetworks } from "data/settings/CustomNetworks"
import { InternalLink } from "components/general"
import { RadioGroup } from "components/form"

const NetworkSetting = () => {
  const { t } = useTranslation()
  const [network, setNetwork] = useNetworkState()
  const networkOptions = useNetworkOptions()
  const { list } = useCustomNetworks()

  if (!networkOptions) return null

  return (
    <>
      <RadioGroup
        options={networkOptions}
        value={network}
        onChange={setNetwork}
      />

      {list.length ? (
        <InternalLink to="/networks" chevron>
          {t("Manage networks")}
        </InternalLink>
      ) : (
        <InternalLink to="/network/new" chevron>
          {t("Add a network")}
        </InternalLink>
      )}
    </>
  )
}

export default NetworkSetting
