import { useTranslation } from "react-i18next"
import { AccAddress, Dec } from "@terra-money/feather.js"
import { getMaxHeightStyle } from "utils/style"
import { combineState } from "data/query"
import { useExchangeRates } from "data/queries/coingecko"
import {
  flattenUnbondings,
  useInterchainUnbondings,
} from "data/queries/staking"
import { ValidatorLink } from "components/general"
import { ModalButton } from "components/feedback"
import { Table } from "components/layout"
import { Read } from "components/token"
import { DateTimeRenderer, TooltipIcon } from "components/display"
import StakedCard from "../components/StakedCard"
import { UnbondingDelegation } from "@terra-money/feather.js"
import { useNetworkWithFeature } from "data/wallet"
import { useNativeDenoms } from "data/token"
import { getDenomFromAddress } from "utils/coin"
import styles from "../CardModal.module.scss"
import { ChainFeature } from "types/chains"

const Unbondings = () => {
  const { t } = useTranslation()
  const networks = useNetworkWithFeature(ChainFeature.STAKING)
  const readNativeDenom = useNativeDenoms()
  const { data: prices, ...pricesState } = useExchangeRates()

  const interchainUnbondings = useInterchainUnbondings()
  const unbondings = interchainUnbondings.reduce(
    (acc, { data }) => (data ? [...data, ...acc] : acc),
    [] as UnbondingDelegation[]
  )
  const state = combineState(pricesState, ...interchainUnbondings)

  /* render */
  const title = t("Undelegations")

  const render = () => {
    if (!unbondings || !prices) return null

    const total = unbondings.reduce((acc, unbonding) => {
      let balance = 0

      unbonding.entries.forEach(
        (entry) => (balance += entry.balance.toNumber())
      )

      const denom = getDenomFromAddress(networks, unbonding.delegator_address)
      const { token, decimals } = readNativeDenom(denom)
      return acc + (balance * (prices[token]?.price || 0)) / 10 ** decimals
    }, 0)

    const list = flattenUnbondings(unbondings)

    return (
      <ModalButton
        title={title}
        renderButton={(open) => (
          <StakedCard
            {...state}
            title={
              <div className={styles.header_wrapper}>
                <TooltipIcon
                  content={t(
                    "A maximum 7 undelegations can be in progress at the same time"
                  )}
                  placement="bottom"
                >
                  {title}
                </TooltipIcon>
                {total !== 0 && (
                  <span className={styles.view_more}>View More</span>
                )}
              </div>
            }
            value={total.toString()}
            onClick={open}
            cardName={"undelegations"}
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
              render: (amount: Dec, { validator_address }) => (
                <Read
                  amount={amount.toString()}
                  denom={getDenomFromAddress(networks, validator_address)}
                />
              ),
              align: "right",
            },
            {
              title: t("Release"),
              dataIndex: "completion_time",
              render: (date: Date) => (
                <DateTimeRenderer format={"localestring"}>
                  {date}
                </DateTimeRenderer>
              ),
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
