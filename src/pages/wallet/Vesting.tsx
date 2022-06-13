import { useTranslation } from "react-i18next"
import { useQuery } from "react-query"
import { useAddress } from "data/wallet"
import { useIsClassic } from "data/query"
import { useLCDClient } from "data/queries/lcdClient"
import { VestingAccountTypes } from "data/queries/vesting"
import { parseVestingSchedule, queryAccounts } from "data/queries/vesting"
import { readNativeDenom } from "data/token"
import { Card } from "components/layout"
import { Read } from "components/token"
import Asset from "./Asset"
import VestingScheduleTable from "./VestingScheduleTable"
import styles from "./Vesting.module.scss"

const Vesting = () => {
  const { t } = useTranslation()
  const isClassic = useIsClassic()
  const { data, ...state } = useQueryVesting()

  if (!data) return null
  if (!Object.values(VestingAccountTypes).includes(data["@type"])) return null

  const schedule = parseVestingSchedule(data)

  return (
    <Card {...state} title={t("Vesting")}>
      <Asset
        {...readNativeDenom("uluna", isClassic)}
        balance={schedule.amount.total}
        hideActions
      />

      <section className={styles.amount}>
        <dl>
          <dt>{t("Vested")}</dt>
          <dd>
            <Read amount={schedule.amount.vested} />
          </dd>
        </dl>
      </section>

      <VestingScheduleTable {...schedule} />
    </Card>
  )
}

export default Vesting

/* query */
const useQueryVesting = () => {
  const address = useAddress()
  const lcd = useLCDClient()

  return useQuery(["accounts", address], async () => {
    if (!address) return null
    return await queryAccounts(address, lcd.config.URL)
  })
}
