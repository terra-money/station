import {
  parseVestingSchedule,
  isVestingAccount,
  useAccount,
} from "data/queries/vesting"
import VestingScheduleTable from "./VestingScheduleTable"
import { useTranslation } from "react-i18next"
import styles from "./Vesting.module.scss"
import { Read } from "components/token"

const Vesting = ({ denom }: { denom: string }) => {
  const { t } = useTranslation()
  const { data } = useAccount()

  if (!data) return null
  if (!isVestingAccount(data)) return null

  const schedule = parseVestingSchedule(data)

  return (
    <>
      <section className={styles.vesting}>
        <dl>
          <dt>{t("Vested")}</dt>
          <dd>
            <Read amount={schedule.amount.vested} denom={denom} />
          </dd>
          <dt>{t("Total")}</dt>
          <dd>
            <Read amount={schedule.amount.total} denom={denom} />
          </dd>
        </dl>
      </section>
      <VestingScheduleTable {...schedule} denom={denom} />
    </>
  )
}

export default Vesting
