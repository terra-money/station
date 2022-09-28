import { useTranslation } from "react-i18next"
import BoltIcon from "@mui/icons-material/Bolt"
import { useLocation } from "react-router-dom"
import { has } from "utils/num"
import { getAmount, sortByDenom } from "utils/coin"
import { useCurrency } from "data/settings/Currency"
import { useMinimumValue } from "data/settings/MinimumValue"
import { readNativeDenom } from "data/token"
import { useIsClassic } from "data/query"
import { useBankBalance } from "data/queries/bank"
import { useIsWalletEmpty, useTerraNativeLength } from "data/queries/bank"
import { useActiveDenoms } from "data/queries/oracle"
import { useMemoizedCalcValue } from "data/queries/oracle"
import { InternalButton, InternalLink } from "components/general"
import { Card, Flex, Grid } from "components/layout"
import { FormError } from "components/form"
import { ListGroup } from "components/display"
import { isWallet } from "auth"
import Asset from "./Asset"
import { useBuyList } from "./Buy"
import SelectMinimumValue from "./SelectMinimumValue"
import { ModalButton, Mode } from "../../components/feedback"

const Coins = () => {
  const { t } = useTranslation()
  const isClassic = useIsClassic()
  const length = useTerraNativeLength()
  const isWalletEmpty = useIsWalletEmpty()
  const { data: denoms, ...state } = useActiveDenoms()
  const coins = useCoins(denoms)
  const { pathname } = useLocation()
  const buyLunaList = useBuyList("Luna")

  const render = () => {
    if (!coins) return

    const [all, filtered] = coins
    const list = isClassic ? filtered : all

    return (
      <>
        <Grid gap={12}>
          {isWalletEmpty && (
            <FormError>{t("Coins required to post transactions")}</FormError>
          )}

          {isClassic && (
            <Flex end>{!isWalletEmpty && <SelectMinimumValue />}</Flex>
          )}

          <section>
            {list.map(({ denom, ...item }) => (
              <Asset
                {...readNativeDenom(denom, isClassic)}
                {...item}
                key={denom}
              />
            ))}
          </section>
        </Grid>
      </>
    )
  }

  const extra = isClassic && (
    <InternalLink
      icon={<BoltIcon style={{ fontSize: 18 }} />}
      to="/swap/multiple"
      disabled={length < 2}
    >
      {t("Swap multiple coins")}
    </InternalLink>
  )

  const extraMobile = !isClassic && buyLunaList && pathname === "/wallet" && (
    <ModalButton
      title={t("Buy {{symbol}}", { symbol: "Luna" })}
      modalType={Mode.FULL_CARD}
      renderButton={(open) => (
        <InternalButton onClick={open} chevron>
          {t("Buy Luna")}
        </InternalButton>
      )}
      maxHeight={false}
    >
      <ListGroup groups={buyLunaList} />
    </ModalButton>
  )

  return (
    <Card
      {...state}
      title={t("Coins")}
      extra={isWallet.mobile() ? extraMobile : extra}
    >
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
  const calcValueByUST = useMemoizedCalcValue("uusd")

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
    currency,
    ({ $: a }, { $: b }) => b - a
  )

  return [coins, coins.filter(({ $ }) => $ >= minimumValue * 1e6)] as const
}
