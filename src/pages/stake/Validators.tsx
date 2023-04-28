/* FIXME(terra.js): Import from terra.js */
import { BondStatus } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import { Delegation } from "@terra-money/feather.js"
import { bondStatusFromJSON } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import WithSearchInput from "pages/custom/WithSearchInput"
import styles from "./Validators.module.scss"
import ValidatorsList from "./ValidatorsList"
import { Flex, Grid, InlineFlex, Page, Table } from "components/layout"
import { useTranslation } from "react-i18next"
import TokenSelector, { TokenInterface } from "components/form/TokenSelector"
import { useNetwork } from "data/wallet"
import { useState } from "react"
import {
  AllianceDelegation,
  AllianceDetails,
  useAllAlliances,
  useInterchainAllianceDelegations,
} from "data/queries/alliance"
import {
  useAllStakingParams,
  useInterchainDelegations,
} from "data/queries/staking"
import { combineState } from "data/query"
import { useNativeDenoms } from "data/token"
import { readPercent } from "@terra-money/terra-utils"
import { Tooltip } from "components/display"

const Validators = () => {
  const { t } = useTranslation()
  const readNativeDenom = useNativeDenoms()
  const networks = useNetwork()
  const [token, setToken] = useState("uluna")

  const alliancesData = useAllAlliances()
  const alliances = alliancesData.reduce(
    (acc, { data }) => (data ? [...acc, ...data] : acc),
    [] as AllianceDetails[]
  )
  const stakingParamsData = useAllStakingParams()
  const unbondingtime = stakingParamsData.reduce(
    (acc, { data }) =>
      data ? { ...acc, [data.chainID]: data.unbonding_time ?? 0 } : acc,
    {} as Record<string, number>
  )

  const delegationsData = useInterchainDelegations()
  const delegations: Delegation[] = delegationsData.reduce(
    (acc, { data }) => (data ? [...data?.delegation, ...acc] : acc),
    [] as Delegation[]
  )
  const allianceDelegationsData = useInterchainAllianceDelegations()
  const allianceDelegations = allianceDelegationsData.reduce(
    (acc, { data }) => (data ? [data, ...acc] : acc),
    [] as { delegations: AllianceDelegation[]; chainID: string }[]
  )

  const state = combineState(
    ...alliancesData,
    ...stakingParamsData,
    ...delegationsData,
    ...allianceDelegationsData
  )

  const options = [
    ...Object.values(networks).map(({ baseAsset, chainID }) => ({
      denom: baseAsset,
      rewards: 1,
      chainID,
      unbonding: (unbondingtime[chainID] ?? 0) / 60 / 60 / 24,
      isAlliance: false,
      hasDelegations: delegations.some(
        ({ balance }) =>
          balance?.denom === baseAsset && Number(balance?.amount) > 0
      ),
    })),
    ...(alliances ?? []).map(({ denom, reward_weight, chainID }) => ({
      denom: denom ?? "",
      rewards: Number(reward_weight),
      chainID,
      unbonding: (unbondingtime[chainID] ?? 0) / 60 / 60 / 24,
      isAlliance: true,
      hasDelegations: allianceDelegations.some(
        ({ chainID: delChainID, delegations }) =>
          delChainID === chainID &&
          delegations.some(
            ({ balance }) =>
              balance?.denom === denom && Number(balance?.amount) > 0
          )
      ),
    })),
  ]

  const tokenList = options.reduce((acc, { denom }) => {
    const token = readNativeDenom(denom)
    return token.lsd
      ? {
          [token.lsd]: readNativeDenom(token.lsd),
          ...acc,
        }
      : {
          [token.token]: token,
          ...acc,
        }
  }, {} as Record<string, TokenInterface>)

  return (
    <Page sub {...state}>
      <header className={styles.select__asset}>
        <p>Select staking asset:</p>
        <TokenSelector
          value={token}
          tokenLists={tokenList}
          onChange={setToken}
        />
      </header>
      <WithSearchInput
        gap={0}
        placeholder={t("Search for validator...")}
        padding
      >
        {(keyword: string) => (
          <main className={styles.table__container}>
            <Table
              dataSource={options.filter(
                ({ denom }) =>
                  readNativeDenom(denom).token === token ||
                  readNativeDenom(denom).lsd === token
              )}
              extra={({ chainID }) => (
                <ValidatorsList keyword={keyword} chainID={chainID} />
              )}
              columns={[
                {
                  title: t("Staking asset"),
                  dataIndex: ["asset", "chainID"],
                  render: (_, option) => {
                    const { denom, chainID, isAlliance } = option
                    const token = readNativeDenom(denom)
                    const network = networks[chainID]

                    return (
                      <Flex start gap={8}>
                        <Grid gap={2}>
                          <Flex gap={4} start>
                            <div className={styles.token__icon__container}>
                              {token && (
                                <img
                                  src={token.icon}
                                  alt={token.symbol}
                                  className={styles.token__icon}
                                />
                              )}
                              {network && (
                                <img
                                  src={network.icon}
                                  alt={network.name}
                                  className={styles.chain__icon}
                                />
                              )}
                            </div>
                            {token.symbol}

                            {isAlliance && (
                              <InlineFlex gap={4} start>
                                <Tooltip
                                  content={
                                    <article>
                                      <h1>Alliance</h1>
                                      <p>
                                        {t(
                                          "Assets of one chain can be staked on another, creating a mutually-beneficial economic partnership through interchain staking"
                                        )}
                                      </p>
                                    </article>
                                  }
                                >
                                  <span className={styles.alliance__logo}>
                                    🤝
                                  </span>
                                </Tooltip>
                              </InlineFlex>
                            )}
                          </Flex>
                        </Grid>
                      </Flex>
                    )
                  },
                },
                {
                  title: t("Chain"),
                  dataIndex: "chainID",
                  render: (chainID) => networks[chainID]?.name || chainID,
                },
                {
                  title: t("Unbonding period"),
                  dataIndex: "unbonding",
                  defaultSortOrder: "desc",
                  sorter: ({ unbonding: a = 0 }, { unbonding: b = 0 }) => a - b,
                  render: (value = 0) => t("{{value}} days", { value }),
                },
                {
                  title: t("Rewards weight"),
                  dataIndex: "rewards",
                  defaultSortOrder: "desc",
                  sorter: ({ rewards: a = 0 }, { rewards: b = 0 }) => a - b,
                  render: (rewards = 0) => readPercent(rewards),
                },
              ]}
            />
          </main>
        )}
      </WithSearchInput>
    </Page>
  )
}

export default Validators

/* helpers */
export const getIsBonded = (status: BondStatus) =>
  bondStatusFromJSON(BondStatus[status]) === BondStatus.BOND_STATUS_BONDED

export const getIsUnbonded = (status: BondStatus) =>
  bondStatusFromJSON(BondStatus[status]) === BondStatus.BOND_STATUS_UNBONDED
