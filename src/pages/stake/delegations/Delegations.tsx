import { useTranslation } from "react-i18next"
import { AccAddress, Coin, Delegation } from "@terra-money/feather.js"
import { getMaxHeightStyle } from "utils/style"
import { combineState } from "data/query"
import { useMemoizedPrices } from "data/queries/coingecko"
import { useInterchainDelegations } from "data/queries/staking"
import { ValidatorLink } from "components/general"
import { ModalButton } from "components/feedback"
import { Table } from "components/layout"
import { Read } from "components/token"
import StakedCard from "../components/StakedCard"
import { useNativeDenoms } from "data/token"
import styles from "../CardModal.module.scss"

const Delegations = () => {
  const { t } = useTranslation()
  const readNativeDenom = useNativeDenoms()
  const { data: prices, ...pricesState } = useMemoizedPrices()

  const interchainDelegations = useInterchainDelegations()

  const delegations: Delegation[] = interchainDelegations.reduce(
    (acc, { data }) => (data ? [...data?.delegation, ...acc] : acc),
    [] as Delegation[]
  )
  const state = combineState(pricesState, ...interchainDelegations)

  /* render */
  const title = t("Delegations")

  const render = () => {
    if (!delegations || !prices) return null

    const total = delegations.reduce((acc, { balance }) => {
      const { token, decimals } = readNativeDenom(balance.denom)
      return (
        acc +
        (balance.amount.toNumber() * (prices[token]?.price || 0)) /
          10 ** decimals
      )
    }, 0)

    return (
      <ModalButton
        title={title}
        renderButton={(open) => (
          <StakedCard
            {...state}
            title={
              <div className={styles.header_wrapper}>
                {title}
                {total !== -1 && (
                  <span className={styles.view_more}>View More</span>
                )}
              </div>
            }
            value={total?.toString() || "0"}
            onClick={open}
            cardName={"delegations"}
          />
        )}
      >
        <Table
          dataSource={delegations}
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

export default Delegations
