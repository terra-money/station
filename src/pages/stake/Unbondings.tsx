import { useTranslation } from "react-i18next"
import { AccAddress, Dec } from "@terra-money/terra.js"
import { getMaxHeightStyle } from "utils/style"
import { useCurrency } from "data/settings/Currency"
import { combineState } from "data/query"
import { useMemoizedCalcValue } from "data/queries/oracle"
import { calcUnbondingsTotal, flattenUnbondings } from "data/queries/staking"
import { useValidators, useUnbondings } from "data/queries/staking"
import { ValidatorLink } from "components/general"
import { ModalButton } from "components/feedback"
import { Table } from "components/layout"
import { Read } from "components/token"
import { ToNow, TooltipIcon } from "components/display"
import StakedCard from "./components/StakedCard"

const Unbondings = () => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const calcValue = useMemoizedCalcValue(currency)

  const { data: validators, ...validatorsState } = useValidators()
  const { data: unbondings, ...unbondingsState } = useUnbondings()
  const state = combineState(validatorsState, unbondingsState)

  /* render */
  const title = t("Undelegations")

  const render = () => {
    if (!unbondings) return null

    const total = calcUnbondingsTotal(unbondings)
    const value = calcValue({ amount: total, denom: "uluna" })
    const list = flattenUnbondings(unbondings)

    return (
      <ModalButton
        title={title}
        renderButton={(open) => (
          <StakedCard
            {...state}
            title={
              <TooltipIcon
                content={t(
                  "Maximum 7 undelegations can be in progress at the same time"
                )}
                placement="bottom"
              >
                {title}
              </TooltipIcon>
            }
            amount={total}
            value={value}
            onClick={open}
          />
        )}
      >
        <Table
          dataSource={list}
          columns={[
            {
              title: t("Validator"),
              dataIndex: "validator_address",
              render: (address: AccAddress) => (
                <ValidatorLink address={address} internal />
              ),
            },
            {
              title: t("Amount"),
              dataIndex: "initial_balance",
              render: (amount: Dec) => (
                <Read amount={amount.toString()} denom="uluna" />
              ),
              align: "right",
            },
            {
              title: t("Release on"),
              dataIndex: "completion_time",
              render: (date: Date) => <ToNow>{date}</ToNow>,
              align: "right",
            },
          ]}
          style={getMaxHeightStyle(320)}
        />
      </ModalButton>
    )
  }

  return render()
}

export default Unbondings
