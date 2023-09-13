import { useTranslation } from "react-i18next"
import { AccAddress, Coin, Delegation } from "@terra-money/feather.js"
import { getMaxHeightStyle } from "utils/style"
import { combineState } from "data/query"
import { useExchangeRates } from "data/queries/coingecko"
import { useInterchainDelegations } from "data/queries/staking"
import { StakingAssetLink } from "components/general"
import { ModalButton } from "components/feedback"
import { Table } from "components/layout"
import { ReadToken } from "components/token"
import StakedCard from "../components/StakedCard"
import { useNativeDenoms } from "data/token"
import styles from "../CardModal.module.scss"
import {
  AllianceDelegation,
  useInterchainAllianceDelegations,
} from "data/queries/alliance"
import { useAllianceHub } from "data/queries/alliance-protocol"
import { getAllianceDelegations } from "data/parsers/alliance-protocol"
import AllianceHubStakeCTA from "../components/AllianceHubStakeCTA"

const Delegations = () => {
  const { t } = useTranslation()
  const readNativeDenom = useNativeDenoms()
  const { data: prices, ...pricesState } = useExchangeRates()
  const allianceHub = useAllianceHub()

  const interchainDelegations = useInterchainDelegations()
  const allianceHubDelegationsData = allianceHub.useDelegations()
  const allianceDelegationsData = useInterchainAllianceDelegations()

  const state = combineState(
    pricesState,
    ...interchainDelegations,
    ...allianceDelegationsData,
    allianceHubDelegationsData
  )

  const delegations: Delegation[] = interchainDelegations.reduce(
    (acc, { data }) => (data ? [...data?.delegation, ...acc] : acc),
    [] as Delegation[]
  )
  const allianceDelegations: AllianceDelegation[] =
    allianceDelegationsData.reduce(
      (acc, { data }) =>
        data?.delegations ? [...data.delegations, ...acc] : acc,
      [] as AllianceDelegation[]
    )
  const allianceHubDelegations = getAllianceDelegations(
    allianceHubDelegationsData?.data
  )

  const allDelegations = [
    ...delegations,
    ...allianceDelegations.map(({ balance, delegation }) => ({
      balance,
      validator_address: delegation?.validator_address,
    })),
    ...allianceHubDelegations.map(({ balance, delegation }) => ({
      balance,
      validator_address: delegation?.validator_address,
    })),
  ]

  const hubAddress = allianceHub.useHubAddress()

  /* render */
  const title = t("Delegations")

  if (!allDelegations || !prices) return null

  let totalTokensAmount = 0
  const totalTokensPrice = allDelegations.reduce((acc, { balance }) => {
    const { token, decimals } = readNativeDenom(balance?.denom ?? "")

    let amount = balance.amount.toNumber() ?? 0
    let tokenPrice = prices[token]?.price ?? 0

    totalTokensAmount += amount
    return acc + (amount * tokenPrice) / Math.pow(10, decimals)
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
              {totalTokensPrice !== -1 && (
                <span className={styles.view_more}>View More</span>
              )}
            </div>
          }
          value={totalTokensPrice?.toString()}
          amount={totalTokensAmount?.toString()}
          onClick={open}
          cardName={"delegations"}
          hideAmount
        />
      )}
    >
      <Table
        dataSource={allDelegations}
        sorter={({ balance: { amount: a } }, { balance: { amount: b } }) =>
          b.minus(a).toNumber()
        }
        columns={[
          {
            title: t("Validator"),
            dataIndex: "validator_address",
            render: (address: AccAddress, r) => {
              if (address === hubAddress) {
                return <AllianceHubStakeCTA denom={r.balance.denom} />
              } else {
                return (
                  <StakingAssetLink
                    address={address}
                    denom={r.balance.denom}
                    internal
                    img
                  />
                )
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

export default Delegations
