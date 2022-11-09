import { useTranslation } from "react-i18next"
import { has } from "utils/num"
import { getAmount, sortByDenom } from "utils/coin"
import { useCurrency } from "data/settings/Currency"
import { useMinimumValue } from "data/settings/MinimumValue"
import { readNativeDenom } from "data/token"
import { useBankBalance } from "data/queries/bank"
import { useIsWalletEmpty } from "data/queries/bank"
import { useActiveDenoms } from "data/queries/coingecko"
import { useMemoizedCalcValue } from "data/queries/coingecko"
import { Card, Grid } from "components/layout"
import { FormError } from "components/form"
import Asset from "./Asset"

const Coins = () => {
  const { t } = useTranslation()
  const isWalletEmpty = useIsWalletEmpty()
  const { data: denoms, ...state } = useActiveDenoms()
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

          {/*
            TODO: Same thing with Coingecko data
          isClassic && (
            <Flex className={styles.select}>
              {!isWalletEmpty && <SelectMinimumValue />}
            </Flex>
          )
          */}

          <section>
            {list.map(({ denom, ...item }) => (
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
    <Card {...state} title={t("Coins")}>
      <Grid gap={32}>{render()}</Grid>
    </Card>
  )
}

export default Coins

/* hooks */
export const useCoins = (denoms?: Denom[]) => {
  const currency = useCurrency()
  const bankBalance = useBankBalance()
  const [minimumValue] = useMinimumValue()
  const calcValue = useMemoizedCalcValue()
  const calcValueByUST = useMemoizedCalcValue()

  if (!denoms) return

  const nativeTokenValues = denoms
    .map((denom) => {
      const balance = getAmount(bankBalance, denom)
      const value = calcValue({ amount: balance, denom }) ?? 0
      const valueByUST = calcValueByUST({ amount: balance, denom }) ?? 0
      return { denom, balance, value: value, $: valueByUST }
    })
    .filter(
      ({ denom, balance }) => ["uluna", "uusd"].includes(denom) || has(balance)
    )

  const coins = sortByDenom(
    nativeTokenValues,
    currency.id,
    ({ $: a }, { $: b }) => b - a
  )

  return [coins, coins.filter(({ $ }) => $ >= minimumValue * 1e6)] as const
}
