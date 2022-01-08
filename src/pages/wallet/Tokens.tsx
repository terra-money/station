import { useTranslation } from "react-i18next"
import { useAddress } from "data/wallet"
import { useCustomTokensIBC } from "data/settings/CustomTokens"
import { useCustomTokensCW20 } from "data/settings/CustomTokens"
import { InternalButton } from "components/general"
import { Card } from "components/layout"
import IBCAsset from "./IBCAsset"
import CW20Asset from "./CW20Asset"
import AddTokens from "./AddTokens"
import Asset from "./Asset"

const Tokens = () => {
  const { t } = useTranslation()
  const address = useAddress()
  const { list: ibc } = useCustomTokensIBC()
  const { list: cw20 } = useCustomTokensCW20()

  const render = () => {
    if (!ibc.length && !cw20.length) return null

    return (
      <>
        {!ibc.length
          ? null
          : ibc.map(({ denom }) => (
              <IBCAsset denom={denom} key={denom}>
                {(item) => <Asset {...item} />}
              </IBCAsset>
            ))}
        {!cw20.length
          ? null
          : cw20.map((item) => (
              <CW20Asset {...item} key={item.token}>
                {(item) => <Asset {...item} />}
              </CW20Asset>
            ))}
      </>
    )
  }

  return (
    <Card
      title={t("Tokens")}
      extra={
        <AddTokens>
          {(open) => (
            <InternalButton disabled={!address} onClick={open} chevron>
              {t("Add tokens")}
            </InternalButton>
          )}
        </AddTokens>
      }
    >
      {render()}
    </Card>
  )
}

export default Tokens
