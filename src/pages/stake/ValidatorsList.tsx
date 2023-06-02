import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { readPercent } from "@terra-money/terra-utils"
import { Validator } from "@terra-money/feather.js"
/* FIXME(terra.js): Import from terra.js */
import { BondStatus } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import { bondStatusFromJSON } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import { combineState } from "data/query"
import { getPriorityVals, useValidators } from "data/queries/staking"
import { getCalcVotingPowerRate } from "data/Terra/TerraAPI"
import { Table, Flex, Grid, Page } from "components/layout"
import ProfileIcon from "./components/ProfileIcon"
import { ValidatorJailed, ValidatorUnbonded } from "./components/ValidatorTag"
import styles from "./Validators.module.scss"
import { LinkButton } from "components/general"

const ValidatorsList = ({
  chainID,
  keyword,
  delegatedTo,
  denom,
}: {
  chainID: string
  keyword: string
  delegatedTo: string[]
  denom: string
}) => {
  const { t } = useTranslation()

  const { data: validators, ...validatorsState } = useValidators(chainID)

  const state = combineState(validatorsState)

  const activeValidators = useMemo(() => {
    if (!validators) return null
    const priorityVals = getPriorityVals(validators)
    const calcRate = getCalcVotingPowerRate(validators)

    return validators
      .filter(({ status }) => keyword || !getIsUnbonded(status))
      .map((validator) => {
        const { operator_address } = validator
        const voting_power_rate = calcRate(operator_address)
        return {
          ...validator,
          rank:
            (priorityVals.includes(operator_address) ? 1 : 0) + Math.random(),
          voting_power_rate,
        }
      })
      .sort((a, b) => b.rank - a.rank)
  }, [validators, keyword])

  if (!activeValidators) return null

  return (
    <Page {...state} invisible>
      <section className={styles.table}>
        <Table
          dataSource={activeValidators}
          filter={({ description: { moniker }, operator_address }) => {
            if (!keyword) return true
            if (moniker.toLowerCase().includes(keyword.toLowerCase()))
              return true
            if (operator_address === keyword) return true
            return false
          }}
          sorter={(a, b) => {
            const jailed = Number(a.jailed) - Number(b.jailed)
            if (jailed) return jailed
            return (
              Number(getIsUnbonded(a.status)) - Number(getIsUnbonded(b.status))
            )
          }}
          rowKey={({ operator_address }) => operator_address}
          columns={[
            {
              title: t("Moniker"),
              dataIndex: ["description", "moniker"],
              defaultSortOrder: "asc",
              sorter: ({ description: a }, { description: b }) =>
                a.moniker.localeCompare(b.moniker),
              render: (moniker, validator) => {
                const { operator_address, jailed, status } = validator

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
                        {jailed && <ValidatorJailed />}
                        {!jailed && getIsUnbonded(status) && (
                          <ValidatorUnbonded />
                        )}
                      </Flex>
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
            {
              title: t("Actions"),
              dataIndex: [],
              render: (_, validator) => {
                const { operator_address } = validator

                return (
                  <LinkButton
                    to={`/stake/${operator_address}/${denom.replaceAll(
                      "/",
                      "="
                    )}#Delegate`}
                    color="primary"
                    size="small"
                  >
                    {delegatedTo.includes(operator_address)
                      ? t("Manage Stake")
                      : t("Stake")}
                  </LinkButton>
                )
              },
            },
          ]}
        />
      </section>
    </Page>
  )
}

export default ValidatorsList

/* helpers */
export const getIsBonded = (status: BondStatus) =>
  bondStatusFromJSON(BondStatus[status]) === BondStatus.BOND_STATUS_BONDED

export const getIsUnbonded = (status: BondStatus) =>
  bondStatusFromJSON(BondStatus[status]) === BondStatus.BOND_STATUS_UNBONDED
