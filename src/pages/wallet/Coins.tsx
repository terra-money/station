import { useTranslation } from "react-i18next"
import { useNativeDenoms } from "data/token"
import { useBankBalance } from "data/queries/bank"
import { useIsWalletEmpty } from "data/queries/bank"
import { Card, Grid } from "components/layout"
import { FormError } from "components/form"
import Asset from "./Asset"

const Coins = () => {
  const { t } = useTranslation()
  const isWalletEmpty = useIsWalletEmpty()
  const readNativeDenom = useNativeDenoms()
  const coins = useBankBalance()

  const render = () => {
    if (!coins) return

    return (
      <>
        <Grid gap={12}>
          {isWalletEmpty && (
            <FormError>{t("Coins required to post transactions")}</FormError>
          )}

          {/*
            TODO: Same thing with Coingecko data
          isClassic && (
            <Flex className={styles.select}>
              {!isWalletEmpty && <SelectMinimumValue />}
            </Flex>
          )
          */}

          <section>
            {coins.map(({ denom, chain, ...item }) => (
              <Asset
                chains={[]}
                denom={denom}
                {...readNativeDenom(denom, chain)}
                {...item}
                id={[
                  // @ts-expect-error
                  readNativeDenom(denom, chain)?.chainID ?? chain,
                  denom,
                ].join(":")}
                key={denom}
              />
            ))}
          </section>
        </Grid>
      </>
    )
  }

  return (
    <Card title={t("Coins")}>
      <Grid gap={32}>{render()}</Grid>
    </Card>
  )
}

export default Coins
