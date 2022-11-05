import { FormError } from "components/form"
import { InternalButton } from "components/general"
import { Grid } from "components/layout"
import { useIsWalletEmpty, useTerraNativeLength } from "data/queries/bank"
import { useActiveDenoms } from "data/queries/oracle"
import {
  useCustomTokensCW20,
  useCustomTokensIBC,
} from "data/settings/CustomTokens"
import { readNativeDenom } from "data/token"
import { useTranslation } from "react-i18next"
import AddTokens from "./AddTokens"
import Asset from "./Asset"
import styles from "./AssetList.module.scss"
import { useCoins } from "./Coins"
import CW20Asset from "./CW20Asset"
import IBCAsset from "./IBCAsset"

const AssetList = () => {
  const { t } = useTranslation()
  const isWalletEmpty = useIsWalletEmpty()
  const { data: denoms } = useActiveDenoms()
  const { list: ibc } = useCustomTokensIBC()
  const { list: cw20 } = useCustomTokensCW20()
  const coins = useCoins(denoms)

  const render = () => {
    if (!coins) return
    const [all] = coins
    const list = all

    return (
      <>
        <Grid gap={12}>
          {isWalletEmpty && (
            <FormError>{t("Coins required to post transactions")}</FormError>
          )}
          <section>
            {list.map(({ denom, ...item }) => (
              <Asset {...readNativeDenom(denom)} {...item} key={denom} />
            ))}
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
          </section>
        </Grid>
      </>
    )
  }

  return (
    <article className={styles.assetlist}>
      <div className={styles.assetlist__title}>
        <h3>Assets</h3>
        <AddTokens>
          {(open) => (
            <InternalButton onClick={open}>{t("Add tokens")}</InternalButton>
          )}
        </AddTokens>
      </div>
      <Grid gap={32} className={styles.assetlist__list}>
        {render()}
      </Grid>
    </article>
  )
}

export default AssetList
