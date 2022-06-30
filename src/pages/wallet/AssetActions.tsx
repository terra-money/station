import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { flatten, uniq } from "ramda"
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined"
import ShortcutOutlinedIcon from "@mui/icons-material/ShortcutOutlined"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import { isDenomTerraNative } from "@terra.kitchen/utils"
import { has } from "utils/num"
import { useIsClassic } from "data/query"
import { useIsWalletEmpty } from "data/queries/bank"
import { useCW20Pairs } from "data/Terra/TerraAssets"
import { InternalButton, InternalLink } from "components/general"
import { ExtraActions } from "components/layout"
import { ModalButton } from "components/feedback"
import Buy from "./Buy"
import { Props } from "./Asset"
import is from "auth/scripts/is"

const AssetActions = ({ token, symbol, balance }: Props) => {
  const { t } = useTranslation()
  const { state } = useLocation()

  const isWalletEmpty = useIsWalletEmpty()
  const isClassic = useIsClassic()
  const getIsSwappableToken = useGetIsSwappableToken()

  return is.mobile() ? (
    <ExtraActions>
      <InternalLink
        icon={<ArrowForwardIosIcon style={{ fontSize: 12 }} />}
        to={`/send?token=${token}`}
        state={state}
        disabled={isWalletEmpty || !has(balance)}
      />
    </ExtraActions>
  ) : (
    <ExtraActions>
      {!isClassic && token === "uluna" && (
        <ModalButton
          title={t("Buy {{symbol}}", { symbol })}
          renderButton={(open) => (
            <InternalButton
              icon={<MonetizationOnOutlinedIcon style={{ fontSize: 18 }} />}
              onClick={open}
            >
              {t("Buy")}
            </InternalButton>
          )}
          maxHeight={false}
        >
          <Buy token={token} />
        </ModalButton>
      )}

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
