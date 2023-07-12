import {
  parseVestingSchedule,
  isVestingAccount,
  useAccount,
} from "data/queries/vesting"
import VestingScheduleTable from "./VestingScheduleTable"
import { useTranslation } from "react-i18next"
import styles from "./Vesting.module.scss"
import { Read } from "components/token"
import { useCurrency } from "data/settings/Currency"

const Vesting = ({ price, symbol }: { price?: number; symbol: string }) => {
  const { t } = useTranslation()
  const { data } = useAccount()
  const currency = useCurrency()

  if (!data) return null
  if (!isVestingAccount(data)) return null

  const schedule = parseVestingSchedule(data)

  return (
    <>
      <section className={styles.vesting}>
        <dl>
          <dt>{t("Vested")}</dt>
          <dd>
            <h1>
              {currency.symbol}{" "}
              {price && (
                <Read
                  amount={price * parseInt(schedule.amount.vested)}
                  fixed={2}
                  denom=""
                  token=""
                />
              )}
            </h1>
            <h2 className={styles.amount}>
              <Read amount={schedule.amount.vested} /> {symbol}
            </h2>
          </dd>
          <dt>{t("Total")}</dt>
          <dd>
            <h1>
              {currency.symbol}{" "}
              {price && (
                <Read
                  amount={price * parseInt(schedule.amount.total)}
                  fixed={2}
                  denom=""
                  token=""
                />
              )}
            </h1>
            <h2 className={styles.amount}>
              <Read amount={schedule.amount.total} /> {symbol}
            </h2>
          </dd>
        </dl>
      </section>
      <VestingScheduleTable {...schedule} />
    </>
  )
}

export default Vesting
