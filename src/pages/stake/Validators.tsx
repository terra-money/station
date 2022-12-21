import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import VerifiedIcon from "@mui/icons-material/Verified"
import { readPercent } from "@terra.kitchen/utils"
import { Validator } from "@terra-money/terra.js"
/* FIXME(terra.js): Import from terra.js */
import { BondStatus } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import { bondStatusFromJSON } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import { combineState, useIsClassic } from "data/query"
import { useValidators } from "data/queries/staking"
import { useDelegations, useUnbondings } from "data/queries/staking"
import { getCalcVotingPowerRate } from "data/Terra/TerraAPI"
import { Page, Card, Table, Flex, Grid } from "components/layout"
import { TooltipIcon } from "components/display"
import { Toggle } from "components/form"
import WithSearchInput from "pages/custom/WithSearchInput"
import ProfileIcon from "./components/ProfileIcon"
import { ValidatorJailed } from "./components/ValidatorTag"
import styles from "./Validators.module.scss"
import shuffle from "utils/shuffle"

const Validators = () => {
  const { t } = useTranslation()
  const isClassic = useIsClassic()

  const { data: validators, ...validatorsState } = useValidators()
  const { data: delegations, ...delegationsState } = useDelegations()
  const { data: undelegations, ...undelegationsState } = useUnbondings()

  const state = combineState(
    validatorsState,
    delegationsState,
    undelegationsState
  )

  const activeValidators = useMemo(() => {
    if (!validators) return null

    const calcRate = getCalcVotingPowerRate(validators)

    return shuffle(validators)
      .filter(({ status }) => !getIsUnbonded(status))
      .map((validator) => {
        const { operator_address } = validator

        const voting_power_rate = calcRate(operator_address)

        return {
          ...validator,
          voting_power_rate,
        }
      })
  }, [validators])

  const renderCount = () => {
    if (!validators) return null
    const count = validators.filter(({ status }) => getIsBonded(status)).length
    return t("{{count}} active validators", { count })
  }

  const [byRank, setByRank] = useState(isClassic)
  const render = (keyword: string) => {
    if (!activeValidators) return null

    return (
      <>
        {isClassic && (
          <section>
            <TooltipIcon
              content={
                <article>
                  <ul className={styles.tooltip}>
                    <li>
                      40%: Uptime <small>(time-weighted, 90 days)</small>
                    </li>
                    <li>
                      30%: Rewards <small>(past 30 days)</small>
                    </li>
                    <li>
                      30%: Gov participation rate{" "}
                      <small>(time-weighted, since Col-5)</small>
                    </li>
                  </ul>

                  <p>
                    <small>
                      Up to 5% is deducted to the validators whose voting power
                      is within top 33%
                    </small>
                  </p>
                </article>
              }
            >
              <Toggle checked={byRank} onChange={() => setByRank(!byRank)}>
                {t("Weighted score")}
              </Toggle>
            </TooltipIcon>
          </section>
        )}

        <Table
          key={Number(byRank)}
          onSort={() => setByRank(false)}
          initialSorterKey={byRank ? undefined : "rewards"}
          dataSource={activeValidators}
          filter={({ description: { moniker }, operator_address }) => {
            if (!keyword) return true
            if (moniker.toLowerCase().includes(keyword.toLowerCase()))
              return true
            if (operator_address === keyword) return true
            return false
          }}
          sorter={(a, b) => Number(a.jailed) - Number(b.jailed)}
          rowKey={({ operator_address }) => operator_address}
          columns={[
            {
              title: t("Moniker"),
              dataIndex: ["description", "moniker"],
              defaultSortOrder: "asc",
              sorter: ({ description: a }, { description: b }) =>
                a.moniker.localeCompare(b.moniker),
              render: (moniker, validator) => {
                const { operator_address, jailed } = validator
                const { description } = validator

                const delegated = delegations?.find(
                  ({ validator_address }) =>
                    validator_address === operator_address
                )

                const undelegated = undelegations?.find(
                  ({ validator_address }) =>
                    validator_address === operator_address
                )

                return (
                  <Flex start gap={8}>
                    <ProfileIcon
                      src={validator.description.identity}
                      size={22}
                    />

                    <Grid gap={2}>
                      <Flex gap={4} start>
                        <Link
                          to={`/validator/${operator_address}`}
                          className={styles.moniker}
                        >
                          {moniker}
                        </Link>

                        {description?.security_contact && (
                          <VerifiedIcon
                            className="info"
                            style={{ fontSize: 12 }}
                          />
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
                )
              },
            },
            {
              title: t("Voting power"),
              dataIndex: "voting_power_rate",
              defaultSortOrder: "desc",
              sorter: (
                { voting_power_rate: a = 0 },
                { voting_power_rate: b = 0 }
              ) => a - b,
              render: (value = 0) => readPercent(value),
              align: "right",
            },
            {
              title: t("Commission"),
              dataIndex: ["commission", "commission_rates"],
              defaultSortOrder: "asc",
              sorter: (
                { commission: { commission_rates: a } },
                { commission: { commission_rates: b } }
              ) => a.rate.toNumber() - b.rate.toNumber(),
              render: ({ rate }: Validator.CommissionRates) =>
                readPercent(rate.toString(), { fixed: 2 }),
              align: "right",
            },
          ]}
        />
      </>
    )
  }

  return (
    <Page title={t("Validators")} extra={renderCount()} sub>
      <Card {...state}>
        <WithSearchInput gap={16}>{render}</WithSearchInput>
      </Card>
    </Page>
  )
}

export default Validators

/* helpers */
export const getIsBonded = (status: BondStatus) =>
  bondStatusFromJSON(BondStatus[status]) === BondStatus.BOND_STATUS_BONDED

export const getIsUnbonded = (status: BondStatus) =>
  bondStatusFromJSON(BondStatus[status]) === BondStatus.BOND_STATUS_UNBONDED
