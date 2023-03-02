import { useTranslation } from "react-i18next"
import { useNativeDenoms } from "data/token"
import { useExchangeRates } from "data/queries/coingecko"
import { combineState } from "data/query"
import { useDelegations } from "data/queries/staking"
import { AccAddress, Coin, Delegation } from "@terra-money/feather.js"
import { ValidatorLink } from "components/general"
import { ModalButton } from "components/feedback"
import { Table } from "components/layout"
import { Read } from "components/token"
import StakedCard from "../components/StakedCard"
import { getMaxHeightStyle } from "utils/style"
import styles from "../CardModal.module.scss"

const ChainDelegations = ({ chain }: { chain: string }) => {
  const { t } = useTranslation()
  const readNativeDenom = useNativeDenoms()
  const { data: prices, ...pricesState } = useExchangeRates()
  const { data, ...chainDelegationsState } = useDelegations(chain)
  const chainDelegations: Delegation[] = data || []

  const state = combineState(pricesState, chainDelegationsState)

  const title = t("Delegations")

  const render = () => {
    if (!chainDelegations || !prices) return null

    const chainDenom = chainDelegations?.[0]?.balance.denom || ""
    const chainTotalPriceAndAmount: any = chainDelegations?.reduce(
      ({ price, amount }, { balance }, index) => {
        const { token, decimals } = readNativeDenom(balance.denom)
        let newPriceHolder = price
        let newAmountHolder = amount
        if (index === 0) {
          newPriceHolder = 0
          newAmountHolder = 0
        }

        return {
          price:
            newPriceHolder +
            (balance.amount.toNumber() * (prices[token]?.price || 0)) /
              10 ** decimals,
          amount: newAmountHolder + balance.amount.toNumber() / 10 ** decimals,
        }
      },
      { price: -1, amount: -1 }
    )

    const totalToDisplay = chainTotalPriceAndAmount?.price
    const showTokens = chainTotalPriceAndAmount?.amount !== -1

    const list = chainDelegations || []

    return (
      <ModalButton
        title={title}
        renderButton={(open) => (
          <StakedCard
            {...state}
            title={
              <div className={styles.header_wrapper}>
                {title}
                {totalToDisplay !== -1 && (
                  <span className={styles.view_more}>View More</span>
                )}
              </div>
            }
            value={totalToDisplay?.toString() || "0"}
            amount={chainTotalPriceAndAmount?.amount?.toString()}
            denom={chainDenom}
            onClick={open}
            cardName={"delegations"}
            showTokens={showTokens}
          />
        )}
      >
        <Table
          dataSource={list}
          sorter={({ balance: { amount: a } }, { balance: { amount: b } }) =>
            b.minus(a).toNumber()
          }
          columns={[
            {
              title: t("Validator"),
              dataIndex: "validator_address",
              render: (address: AccAddress) => (
                <ValidatorLink address={address} internal />
              ),
            },
            {
              title: t("Delegated"),
              dataIndex: "balance",
              render: (balance: Coin) => <Read {...balance.toData()} />,
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

export default ChainDelegations
