import { useTranslation } from "react-i18next"
import { getAmount } from "utils/coin"
import { readNativeDenom } from "data/token"
import { useBankBalance } from "data/queries/bank"
import { useIsWalletEmpty } from "data/queries/bank"
import { Card, Grid } from "components/layout"
import { FormError } from "components/form"
import Asset from "./Asset"

const Coins = () => {
  const { t } = useTranslation()
  const isWalletEmpty = useIsWalletEmpty()
  const coins = useCoins()

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
            {coins.map(({ denom, ...item }) => (
              <Asset
                denom={denom}
                {...readNativeDenom(denom)}
                {...item}
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

/* hooks */
export const useCoins = () => {
  const bankBalance = useBankBalance()

  const nativeTokenValues = bankBalance.denoms().map((denom) => {
    const balance = getAmount(bankBalance, denom)
    return { denom, balance }
  })

  return nativeTokenValues
}
