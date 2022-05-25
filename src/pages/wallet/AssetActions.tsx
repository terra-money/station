import { useTranslation } from "react-i18next"
import { flatten, uniq } from "ramda"
import ShortcutOutlinedIcon from "@mui/icons-material/ShortcutOutlined"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import { isDenomTerraNative } from "@terra.kitchen/utils"
import { has } from "utils/num"
import { useIsClassic } from "data/query"
import { useIsWalletEmpty } from "data/queries/bank"
import { useCW20Pairs } from "data/Terra/TerraAssets"
import { InternalLink } from "components/general"
import { ExtraActions } from "components/layout"
import { Props } from "./Asset"

const AssetActions = ({ token, symbol, balance }: Props) => {
  const { t } = useTranslation()
  const isWalletEmpty = useIsWalletEmpty()
  const isClassic = useIsClassic()
  const getIsSwappableToken = useGetIsSwappableToken()

  return (
    <ExtraActions>
      <InternalLink
        icon={<ShortcutOutlinedIcon style={{ fontSize: 18 }} />}
        to={`/send?token=${token}`}
        disabled={isWalletEmpty || !has(balance)}
      >
        {t("Send")}
      </InternalLink>

      {isClassic && (
        <InternalLink
          icon={<RestartAltIcon style={{ fontSize: 18 }} />}
          to="/swap"
          state={token}
          disabled={
            isWalletEmpty || !has(balance) || !getIsSwappableToken(token)
          }
        >
          {t("Swap")}
        </InternalLink>
      )}
    </ExtraActions>
  )
}

export default AssetActions

/* helpers */
const useGetIsSwappableToken = () => {
  const { data: pairs } = useCW20Pairs()

  return (token: TerraAddress) => {
    if (isDenomTerraNative(token)) return true
    if (!pairs) return false
    const terraswapAvailableList = uniq(flatten(Object.values(pairs)))
    return terraswapAvailableList.find(({ assets }) => assets.includes(token))
  }
}
