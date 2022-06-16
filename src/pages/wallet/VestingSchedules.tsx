import { useTranslation } from "react-i18next"

import { ParsedVestingSchedule } from "data/queries/vesting"
import { Read, ReadPercent } from "components/token"
import styles from "./Vesting.module.scss"
import { Flex, InlineFlex } from "../../components/layout"
import { LoadingCircular } from "../../components/feedback"
import { ReactComponent as CheckIcon } from "styles/images/icons/Check.svg"
import { getRatio } from "../../utils/num"
import { format } from "date-fns"

const VestingSchedules = ({
  type,
  amount,
  schedule,
}: ParsedVestingSchedule) => {
  const { t } = useTranslation()

  const parseDate = (date: Date | undefined) => {
    return date && format(date, "MMM d, y")
  }

  return (
    <>
      {(amount.vested !== "0" || type !== "Periodic") && (
        <section className={styles.vestedWrapper}>
          {amount.vested !== "0" && (
            <Flex end gap={6} className={styles.vested}>
              <InlineFlex gap={4}>{t("Released :")}</InlineFlex>
              <Read amount={amount.vested} />|{" "}
              <ReadPercent>{getRatio(amount.vested, amount.total)}</ReadPercent>
            </Flex>
          )}
          {type !== "Periodic" &&
            schedule.map(({ start, end, toNow }, idx) => (
              <Flex
                key={`non-periodic-${idx}`}
                end
                gap={6}
                className={styles.onerelease}
              >
                <InlineFlex
                  gap={4}
                  className={toNow === "now" ? styles.releasing : undefined}
                >
                  {toNow !== "future" &&
                    (toNow === "past" ? (
                      <CheckIcon {...{ width: 12, height: 12 }} />
                    ) : (
                      <LoadingCircular size={10} />
                    ))}
                  {toNow === "future"
                    ? t("Release on")
                    : toNow === "past"
                    ? t("Released")
                    : t("Releasing")}
                </InlineFlex>
                <span
                  className={toNow === "now" ? styles.onereleasing : undefined}
                >
                  {[parseDate(start), parseDate(end)]
                    .filter(Boolean)
                    .join(" ~ ")}
                </span>
              </Flex>
            ))}
        </section>
      )}
      {type === "Periodic" && (
        <section className={styles.scheduleWrapper}>
          {schedule.map(({ start, end, toNow, amount, ratio }, idx) => (
            <article key={`periodic-${idx}`} className={styles.schedule}>
              <Flex className={styles.index}>{idx + 1}</Flex>

              <Flex start gap={6} className={styles.ratio}>
                <ReadPercent>{ratio}</ReadPercent>
                <Read amount={amount} />
              </Flex>

              <Flex start gap={6} className={styles.release}>
                <InlineFlex
                  gap={4}
                  className={toNow === "now" ? styles.releasing : undefined}
                >
                  {toNow !== "future" &&
                    (toNow === "past" ? (
                      <CheckIcon {...{ width: 12, height: 12 }} />
                    ) : (
                      <LoadingCircular size={10} />
                    ))}
                  {toNow === "future"
                    ? t("Release on")
                    : toNow === "past"
                    ? t("Released")
                    : t("Releasing")}
                </InlineFlex>
                <span>
                  {[parseDate(start), parseDate(end)]
                    .filter(Boolean)
                    .join(" ~ ")}
                </span>
              </Flex>
            </article>
          ))}
        </section>
      )}
    </>
  )
}

export default VestingSchedules
