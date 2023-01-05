import { useTranslation } from "react-i18next"
import { getAmount, sortCoins } from "utils/coin"
import { useCommunityPool } from "data/queries/distribution"
import { useMemoizedCalcValue } from "data/queries/coingecko"
import { Card } from "components/layout"
import { Read } from "components/token"
import SelectDenom from "./components/SelectDenom"
import DashboardContent from "./components/DashboardContent"

const CommunityPool = () => {
  const { t } = useTranslation()
  const title = t("Community pool")

  const { data, ...state } = useCommunityPool("phoenix-1")
  const calcValue = useMemoizedCalcValue()

  const render = () => {
    if (!data) return null
    const amount = getAmount(data, "uluna")
    const value = <Read amount={amount} denom="uluna" prefix />
    const list = sortCoins(data)
      .map((item) => ({ ...item, value: calcValue(item) }))
      .sort(({ value: a }, { value: b }) => Number(b) - Number(a))

    return (
      <DashboardContent
        value={value}
        footer={<SelectDenom title={title} list={list} />}
      />
    )
  }

  return (
    <Card {...state} title={title} size="small">
      {render()}
    </Card>
  )
}

export default CommunityPool
