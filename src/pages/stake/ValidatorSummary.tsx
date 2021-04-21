import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { readPercent } from "@terra.kitchen/utils"
import { AccAddress } from "@terra-money/terra.js"
import { Content } from "types/components"
import { TerraValidator } from "types/validator"
import { combineState } from "data/query"
import { calcSelfDelegation } from "data/Terra/TerraAPI"
import { useUptime, useVotingPowerRate } from "data/Terra/TerraAPI"
import { FinderLink } from "components/general"
import { Card, Grid } from "components/layout"
import { ToNow } from "components/display"
import Uptime from "./components/Uptime"
import styles from "./ValidatorSummary.module.scss"

const ValidatorSummary = ({ validator }: { validator: TerraValidator }) => {
  const { t } = useTranslation()

  const { operator_address, commission } = validator
  const { commission_rates, update_time } = commission
  const { max_change_rate, max_rate, rate } = commission_rates

  const { data: votingPowerRate, ...votingPowerRateState } =
    useVotingPowerRate(operator_address)

  const { data: uptime, ...uptimeState } = useUptime(validator)
  const state = combineState(votingPowerRateState, uptimeState)

  const contents = useMemo(() => {
    if (!(votingPowerRate && uptime)) return []

    return [
      {
        title: t("Voting power"),
        content: readPercent(votingPowerRate),
      },
      {
        title: t("Self delegation"),
        content: readPercent(calcSelfDelegation(validator)),
      },
      {
        title: `${t("Uptime")} (${t("Last 10k blocks")})`,
        content: <Uptime>{uptime}</Uptime>,
      },
    ]
  }, [t, uptime, validator, votingPowerRate])

  const commissions = [
    {
      title: t("Current"),
      content: readPercent(rate),
    },
    {
      title: t("Max"),
      content: readPercent(max_rate),
    },
    {
      title: t("Max daily change"),
      content: readPercent(max_change_rate),
    },
    {
      title: t("Last changed"),
      content: <ToNow>{new Date(update_time)}</ToNow>,
    },
  ]

  const addresses = [
    {
      title: t("Operator address"),
      content: <FinderLink validator>{operator_address}</FinderLink>,
    },
    {
      title: t("Wallet address"),
      content: (
        <FinderLink>{AccAddress.fromValAddress(operator_address)}</FinderLink>
      ),
    },
  ]

  const renderItem = ({ title, content }: Content) => {
    return (
      <Grid className={styles.item} key={title}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.value}>{content}</p>
      </Grid>
    )
  }

  return (
    <Card {...state}>
      {contents && (
        <Grid className={styles.numbers}>{contents.map(renderItem)}</Grid>
      )}

      <Grid className={styles.numbers}>{commissions.map(renderItem)}</Grid>
      <Grid gap={12} className={styles.addresses}>
        {addresses.map(renderItem)}
      </Grid>
    </Card>
  )
}

export default ValidatorSummary
