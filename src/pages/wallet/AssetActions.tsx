import { useTranslation } from "react-i18next"
import ShortcutOutlinedIcon from "@mui/icons-material/ShortcutOutlined"
import { has } from "utils/num"
import { useIsWalletEmpty } from "data/queries/bank"
import { InternalLink } from "components/general"
import { ExtraActions } from "components/layout"
import { Props } from "./Asset"

const AssetActions = ({ token, symbol, balance }: Props) => {
  const { t } = useTranslation()
  const isWalletEmpty = useIsWalletEmpty()

  return (
    <ExtraActions>
      <InternalLink
        icon={<ShortcutOutlinedIcon style={{ fontSize: 18 }} />}
        to={`/send?token=${token}`}
        disabled={isWalletEmpty || !has(balance)}
      >
        {t("Send")}
      </InternalLink>
    </ExtraActions>
  )
}

export default AssetActions
