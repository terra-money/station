import { useTranslation } from "react-i18next"
import { flatten, uniq } from "ramda"
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined"
import ShortcutOutlinedIcon from "@mui/icons-material/ShortcutOutlined"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { isDenomTerraNative } from "@terra-money/terra-utils"
import { has } from "utils/num"
import { useNetworkName } from "data/wallet"
import { useIsWalletEmpty } from "data/queries/bank"
import { useCW20Pairs } from "data/Terra/TerraAssets"
import { useTFMTokens } from "data/external/tfm"
import {
  InternalButton,
  InternalLink,
  ExternalIconLink,
} from "components/general"
import { ExtraActions } from "components/layout"
import { ModalButton } from "components/feedback"
import { ListGroup } from "components/display"
import { useBuyList } from "./Buy"
import { Props } from "./Asset"

const AssetActions = ({ token, symbol, balance }: Props) => {
  const { t } = useTranslation()
  const isWalletEmpty = useIsWalletEmpty()
  const networkName = useNetworkName()
  const getIsSwappableToken = useGetIsSwappableToken()
  const buyList = useBuyList(symbol)

  return (
    <ExtraActions>
      {buyList && (
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
          <ListGroup groups={buyList} />
        </ModalButton>
      )}

      {token.startsWith("ibc/") && (
        <ExternalIconLink
          icon={<OpenInNewIcon style={{ fontSize: 18 }} />}
          href={`https://bridge.terra.money`}
        >
          {t("Bridge")}
        </ExternalIconLink>
      )}

      <InternalLink
        icon={<ShortcutOutlinedIcon style={{ fontSize: 18 }} />}
        to={`/send?token=${token}`}
        disabled={isWalletEmpty || !has(balance)}
      >
        {t("Send")}
      </InternalLink>

      {networkName !== "testnet" && (
        <InternalLink
          icon={<RestartAltIcon style={{ fontSize: 18 }} />}
          to="/"
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
  const networkName = useNetworkName()
  const { data: TFMTokens } = useTFMTokens()

  return (token: TerraAddress) => {
    if (isDenomTerraNative(token)) return true
    if (networkName === "testnet") return false
    else {
      if (!TFMTokens) return false
      return TFMTokens.find(({ contract_addr }) => token === contract_addr)
    }
  }
}
