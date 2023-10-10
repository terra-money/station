import {
  parseVestingSchedule,
  isVestingAccount,
  useAccount,
} from "data/queries/vesting"
import VestingScheduleTable from "./VestingScheduleTable"
import { useTranslation } from "react-i18next"
import styles from "./Vesting.module.scss"
import { ReadToken } from "components/token"

const Vesting = ({ denom }: { denom: Denom }) => {
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
            <ReadToken denom={denom} amount={schedule.amount.vested} />
          </dd>
          <dt>{t("Total")}</dt>
          <dd>
            <ReadToken denom={denom} amount={schedule.amount.total} />
          </dd>
        </dl>
      </section>
      <VestingScheduleTable {...schedule} />
    </>
  )
}

export default Vesting
