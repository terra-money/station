import { useRef } from "react"
import { useTranslation } from "react-i18next"
import { getAmount, sortCoins } from "utils/coin"
import { useCommunityPool } from "data/queries/distribution"
import { useMemoizedCalcValue } from "data/queries/oracle"
import { Card } from "components/layout"
import { Read } from "components/token"
import SelectDenom from "./components/SelectDenom"
import DashboardContent from "./components/DashboardContent"
import { isWallet } from "auth"
import { ModalRef } from "../../components/feedback"

const CommunityPool = () => {
  const { t } = useTranslation()
  const title = t("Community pool")

  const { data, ...state } = useCommunityPool()
  const calcValue = useMemoizedCalcValue()

  const modalRef = useRef<ModalRef>({
    open: () => {},
    close: () => {},
  })

  if (!data) return null

  const amount = getAmount(data, "uluna")
  const value = <Read amount={amount} denom="uluna" prefix />

  const list = sortCoins(data)
    .map((item) => ({ ...item, value: calcValue(item) }))
    .sort(({ value: a }, { value: b }) => Number(b) - Number(a))

  const render = () => {
    return (
      <DashboardContent
        value={value}
        footer={!isWallet.mobile() && <SelectDenom title={title} list={list} />}
      />
    )
  }

  return (
    <Card
      {...state}
      title={title}
      size="small"
      extra={
        isWallet.mobile() && (
          <SelectDenom ref={modalRef} title={title} list={list} />
        )
      }
      onClick={
        isWallet.mobile() && list.length > 1
          ? () => modalRef.current.open()
          : undefined
      }
    >
      {render()}
    </Card>
  )
}

export default CommunityPool
