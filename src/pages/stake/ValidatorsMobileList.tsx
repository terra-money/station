import { PropsWithChildren, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import VerifiedIcon from "@mui/icons-material/Verified"
import { readPercent } from "@terra.kitchen/utils"

import { useIsClassic } from "data/query"
import { Card, Flex, Grid } from "components/layout"
import { RadioGroup } from "components/form"
import { Read } from "components/token"
import ProfileIcon from "./components/ProfileIcon"
import Uptime from "./components/Uptime"
import { ValidatorJailed } from "./components/ValidatorTag"
import styles from "./Validators.module.scss"
import { ReactComponent as SortingIcon } from "styles/images/icons/Sorting.svg"
import { ModalButton, ModalRef, Mode } from "components/feedback"
import { TerraValidator } from "types/validator"
import { Delegation, UnbondingDelegation } from "@terra-money/terra.js"

export interface ActiveValidator extends TerraValidator {
  rank: number
  voting_power_rate: number | undefined
}

interface Props {
  activeValidators: any[] | undefined
  delegations: Delegation[] | undefined
  undelegations: UnbondingDelegation[] | undefined
  keyword?: string | undefined
}

const ValidatorsMobileList = (props: PropsWithChildren<Props>) => {
  const { activeValidators, delegations, undelegations, keyword } = props
  const { t } = useTranslation()
  const isClassic = useIsClassic()

  const selectorRef = useRef<ModalRef>({
    open: () => {},
    close: () => {},
  })
  const [currentFilter, setCurrentFilter] = useState("voting_power_rate")

  const filterOptions = isClassic
    ? [
        { value: "voting_power_rate", label: "Voting power : high to low" },
        { value: "time_weighted_uptime", label: "Uptime : high to low" },
        { value: "commission", label: "Commission : low to high" },
        { value: "rewards_30d", label: "Rewards : high to low" },
      ]
    : [
        { value: "voting_power_rate", label: "Voting power : high to low" },
        { value: "commission", label: "Commission : low to high" },
      ]

  const sortedList = useMemo(() => {
    const filteredList = activeValidators?.filter(
      ({ description: { moniker }, operator_address }) => {
        if (!keyword) return true
        if (moniker.toLowerCase().includes(keyword.toLowerCase())) return true
        if (operator_address === keyword) return true
        return false
      }
    )

    switch (currentFilter) {
      case "voting_power_rate":
        return filteredList?.sort(
          ({ voting_power_rate: a = 0 }, { voting_power_rate: b = 0 }) => b - a
        )
      case "time_weighted_uptime":
        return filteredList?.sort(
          ({ time_weighted_uptime: a = 0 }, { time_weighted_uptime: b = 0 }) =>
            b - a
        )
      case "commission":
        return filteredList?.sort(
          (
            { commission: { commission_rates: a } },
            { commission: { commission_rates: b } }
          ) => a.rate.toNumber() - b.rate.toNumber()
        )
      case "rewards_30d":
        return filteredList?.sort(
          ({ rewards_30d: a = "0" }, { rewards_30d: b = "0" }) =>
            Number(b) - Number(a)
        )
      default:
        return filteredList
    }
  }, [activeValidators, currentFilter, keyword])

  return (
    <>
      <ModalButton
        ref={selectorRef}
        modalType={Mode.SELECT}
        renderButton={(open) => (
          <Card className="blank" onClick={open}>
            <Flex end gap={8}>
              <SortingIcon
                {...{ width: 16, height: 16, fill: "currentColor" }}
              />
              {
                filterOptions.find((item) => item.value === currentFilter)
                  ?.label
              }
            </Flex>
          </Card>
        )}
      >
        <Grid gap={20}>
          <RadioGroup
            options={filterOptions}
            value={currentFilter}
            onChange={(value) => {
              selectorRef.current?.close()
              setCurrentFilter(value)
            }}
            mobileModal={true}
          />
        </Grid>
      </ModalButton>

      {sortedList?.map((validator, idx) => {
        const { voting_power_rate, commission } = validator
        const { time_weighted_uptime, rewards_30d } = validator
        const { operator_address, jailed } = validator
        const { description, picture, contact } = validator

        const delegated = delegations?.find(
          ({ validator_address }) => validator_address === operator_address
        )

        const undelegated = undelegations?.find(
          ({ validator_address }) => validator_address === operator_address
        )

        return (
          <Card
            key={`mobile-card-${idx}`}
            className="inBlank"
            to={`/validator/${operator_address}`}
            title={
              <Flex start gap={8} className={styles.mobileTitle}>
                <ProfileIcon src={picture} size={20} />
                <Grid gap={2}>
                  <Flex gap={4} start>
                    <div className={styles.moniker}>{description?.moniker}</div>

                    {contact?.email && (
                      <VerifiedIcon className="info" style={{ fontSize: 12 }} />
                    )}

                    {jailed && <ValidatorJailed />}
                  </Flex>

                  {(delegated || undelegated) && (
                    <p className={styles.muted}>
                      {[
                        delegated && t("Delegated"),
                        undelegated && t("Undelegated"),
                      ]
                        .filter(Boolean)
                        .join(" | ")}
                    </p>
                  )}
                </Grid>
              </Flex>
            }
          >
            <dl className={styles.dlGap}>
              <dt>{t("Voting power")}</dt>
              <dd>{readPercent(voting_power_rate)}</dd>
            </dl>
            {isClassic && time_weighted_uptime && (
              <dl className={styles.dlGap}>
                <dt>{t("Uptime")}</dt>
                <dd>
                  <Uptime>{time_weighted_uptime}</Uptime>
                </dd>
              </dl>
            )}
            <dl className={styles.dlGap}>
              <dt>{t("Commission")}</dt>
              <dd>
                {readPercent(commission?.commission_rates.rate.toString(), {
                  fixed: 2,
                })}
              </dd>
            </dl>
            {isClassic && !!rewards_30d && (
              <dl className={styles.dlGap}>
                <dt>{t("Rewards")}</dt>
                <dd>
                  <Read
                    amount={Number(rewards_30d) * 100}
                    denom="uluna"
                    decimals={0}
                    fixed={6}
                  />
                </dd>
              </dl>
            )}
          </Card>
        )
      })}
    </>
  )
}

export default ValidatorsMobileList
