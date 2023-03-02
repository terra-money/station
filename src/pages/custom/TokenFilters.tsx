import { Checkbox } from "components/form"
import { useTokenFilters } from "utils/localStorage"
import { useTranslation } from "react-i18next"
import { Flex } from "components/layout"

const TokenFilters = () => {
  const {
    hideNoWhitelist,
    hideLowBal,
    toggleHideNoWhitelist,
    toggleHideLowBal,
  } = useTokenFilters()
  const { t } = useTranslation()

  return (
    <Flex gap={20} start>
      <Checkbox onChange={toggleHideNoWhitelist} checked={hideNoWhitelist}>
        {t("Hide non-whitelisted")}
      </Checkbox>
      <Checkbox onChange={toggleHideLowBal} checked={hideLowBal}>
        {t("Hide low-balance")}
      </Checkbox>
    </Flex>
  )
}

export default TokenFilters
