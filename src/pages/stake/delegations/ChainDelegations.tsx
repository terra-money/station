import { useTranslation } from "react-i18next"
import { useNativeDenoms } from "data/token"
import { useExchangeRates } from "data/queries/coingecko"
import { combineState } from "data/query"
import { useDelegations } from "data/queries/staking"
import { AccAddress, Coin } from "@terra-money/feather.js"
import { ValidatorLink } from "components/general"
import { ModalButton } from "components/feedback"
import { Table } from "components/layout"
import { ReadToken } from "components/token"
import StakedCard from "../components/StakedCard"
import { getMaxHeightStyle } from "utils/style"
import styles from "../CardModal.module.scss"
import { useAllianceHub } from "data/queries/alliance-protocol"
import { parseResToDelegation } from "data/parsers/alliance-protocol"
import { useNetwork } from "data/wallet"
import AllianceHubStakeCTA from "../components/AllianceHubStakeCTA"

const ChainDelegations = ({ chain }: { chain: string }) => {
  const { t } = useTranslation()
  const readNativeDenom = useNativeDenoms()
  const networks = useNetwork()
  const allianceHub = useAllianceHub()
  const { data: prices, ...pricesState } = useExchangeRates()
  const { data: hubDelegations, ...hubDelegationsState } =
    allianceHub.useDelegations()
  const { data: nativeDelegations, ...chainDelegationsState } =
    useDelegations(chain)

  const state = combineState(
    pricesState,
    chainDelegationsState,
    hubDelegationsState
  )

  const currentNetwork = networks[chain]
  const chainDelegations = nativeDelegations?.reduce(
    (acc, item) => (item ? [...acc, item] : acc),
    parseResToDelegation(hubDelegations, chain)
  )

  const title = t("Delegations")

  if (!chainDelegations || !prices) return null

  const chainDenom = currentNetwork?.baseAsset
  const chainTotalPriceAndAmount: any = chainDelegations?.reduce(
    ({ price, amount }, { balance }, index) => {
      const { token, decimals } = readNativeDenom(balance.denom)
      let newPriceHolder = price
      let newAmountHolder = amount
      if (index === 0) {
        newPriceHolder = 0
        newAmountHolder = 0
      }

      if (chainDenom === balance.denom) {
        return {
          price:
            newPriceHolder +
            (balance.amount.toNumber() * (prices[token]?.price || 0)) /
              Math.pow(10, decimals),
          amount:
            newAmountHolder +
            balance.amount.toNumber() / Math.pow(10, decimals),
        }
      }

      return { price, amount }
    },
    { price: 0, amount: 0 }
  )

  return (
    <ModalButton
      title={title}
      renderButton={(open) => (
        <StakedCard
          {...state}
          title={
            <div className={styles.header_wrapper}>
              {title}
              {chainDelegations?.length > 0 && (
                <span className={styles.view_more}>View More</span>
              )}
            </div>
          }
          value={chainTotalPriceAndAmount?.price?.toString()}
          amount={chainTotalPriceAndAmount?.amount?.toString()}
          denom={chainDenom}
          onClick={open}
          cardName={"delegations"}
          forceClickAction={chainDelegations?.length > 0}
        />
      )}
    >
      <Table
        dataSource={chainDelegations}
        sorter={({ balance: { amount: a } }, { balance: { amount: b } }) =>
          b.minus(a).toNumber()
        }
        columns={[
          {
            title: t("Validator"),
            dataIndex: "validator_address",
            render: (address: AccAddress, r) => {
              if (address === allianceHub.useHubAddress()) {
                return <AllianceHubStakeCTA denom={r.balance.denom} />
              } else {
                return <ValidatorLink address={address} internal />
              }
            },
          },
          {
            title: t("Delegated"),
            dataIndex: "balance",
            render: (balance: Coin) => <ReadToken {...balance.toData()} />,
            align: "right",
          },
        ]}
        style={getMaxHeightStyle(320)}
      />
    </ModalButton>
  )
}

export default ChainDelegations
