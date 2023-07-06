import { useTranslation } from "react-i18next"
import { UnbondingDelegation } from "@terra-money/feather.js"
import { AccAddress, Dec } from "@terra-money/feather.js"
import { useNetworkWithFeature } from "data/wallet"
import { useNativeDenoms } from "data/token"
import { useExchangeRates } from "data/queries/coingecko"
import { combineState } from "data/query"
import { flattenUnbondings, useUnbondings } from "data/queries/staking"
import { getDenomFromAddress } from "utils/coin"
import { getMaxHeightStyle } from "utils/style"
import { ValidatorLink } from "components/general"
import { ModalButton } from "components/feedback"
import { Table } from "components/layout"
import { Read } from "components/token"
import { DateTimeRenderer, TooltipIcon } from "components/display"
import StakedCard from "../components/StakedCard"
import styles from "../CardModal.module.scss"
import { ChainFeature } from "types/chains"

const ChainUnbondings = ({ chain }: { chain: string }) => {
  const { t } = useTranslation()
  const networks = useNetworkWithFeature(ChainFeature.STAKING)
  const readNativeDenom = useNativeDenoms()
  const { data: prices, ...pricesState } = useExchangeRates()
  const { data, ...unbondingsState } = useUnbondings(chain)
  const chainUnbondings: UnbondingDelegation[] = data || []

  const state = combineState(pricesState, unbondingsState)

  /* render */
  const title = t("Undelegations")

  const render = () => {
    if (!chainUnbondings || !prices) return null

    let chainDenom = ""
    const chainTotalPriceAndAmount: any = chainUnbondings?.reduce(
      ({ price, amount }, unbonding, index) => {
        let balance = 0
        unbonding.entries.forEach(
          (entry) => (balance += entry.balance.toNumber())
        )

        const denom = getDenomFromAddress(networks, unbonding.delegator_address)
        chainDenom = denom
        const { token, decimals } = readNativeDenom(denom)

        let newPriceHolder = price
        let newAmountHolder = amount
        if (index === 0) {
          newPriceHolder = 0
          newAmountHolder = 0
        }

        return {
          price:
            newPriceHolder +
            (balance * (prices[token]?.price || 0)) / 10 ** decimals,
          amount: newAmountHolder + balance / 10 ** decimals,
        }
      },
      { price: -1, amount: -1 }
    )

    const list = flattenUnbondings(chainUnbondings)
    const totalToDisplay = chainTotalPriceAndAmount?.price
    const showTokens = chainTotalPriceAndAmount?.amount !== -1

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
                {totalToDisplay !== -1 && (
                  <span className={styles.view_more}>View More</span>
                )}
              </div>
            }
            value={totalToDisplay.toString()}
            amount={chainTotalPriceAndAmount?.amount?.toString()}
            denom={chainDenom}
            onClick={open}
            cardName={"undelegations"}
            showTokens={showTokens}
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

export default ChainUnbondings
