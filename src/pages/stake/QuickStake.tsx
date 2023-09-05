import { Button } from "components/general"
import { Flex, Grid, InlineFlex, Page, Table } from "components/layout"
import { useBalances } from "data/queries/bank"
import { TokenType, useNativeDenoms } from "data/token"
import { useNetworkWithFeature } from "data/wallet"
import { useTranslation } from "react-i18next"
import styles from "./QuickStake.module.scss"
import { ModalButton } from "components/feedback"
import {
  AllianceDetails,
  useAllAlliances,
  useInterchainAllianceDelegations,
} from "data/queries/alliance"
import {
  useAllStakingParams,
  useInterchainDelegations,
  getChainUnbondTime,
} from "data/queries/staking"
import { combineState } from "data/query"
import { Tooltip, TooltipIcon } from "components/display"
import { Delegation } from "@terra-money/feather.js"
import TokenSelector, {
  TokenInterface,
} from "components/form/Selectors/TokenSelector/TokenSelector"
import { useState } from "react"
import { useAllianceHub } from "data/queries/alliance-protocol"
import { ChainFeature } from "types/chains"
import { useQuickStakeForm } from "./hooks/useQuickStake"

export enum QuickStakeAction {
  DELEGATE = "Delegate",
  UNBOND = "Undelegate",
}

const QuickStake = () => {
  const { t } = useTranslation()
  const quickStakeForm = useQuickStakeForm(t)
  const readNativeDenom = useNativeDenoms()
  const networks = useNetworkWithFeature(ChainFeature.STAKING)
  const [token, setToken] = useState<string | undefined>("uluna")
  const allianceHub = useAllianceHub()
  const balancesRes = useBalances()

  const allianceHubAssets = allianceHub.useWhitelistedAssets()
  const alliancesData = useAllAlliances()
  const alliances = alliancesData.reduce(
    (acc, { data }) => (data ? [...acc, ...data] : acc),
    allianceHubAssets.data ? allianceHubAssets.data : ([] as AllianceDetails[])
  )

  const stakingParamsData = useAllStakingParams()
  const unbondingtime = stakingParamsData.reduce(
    (acc, { data }) =>
      data ? { ...acc, [data?.chainID]: data.unbonding_time ?? 0 } : acc,
    {} as Record<string, number>
  )
  const delegationsData = useInterchainDelegations()
  const delegations: Delegation[] = delegationsData.reduce(
    (acc, { data }) => (data ? [...data?.delegation, ...acc] : acc),
    [] as Delegation[]
  )
  const alliancesHubDelegations = allianceHub.useDelegations()
  const alliancesDelegationsData = useInterchainAllianceDelegations()
  const alliancesDelegations = alliancesDelegationsData.reduce(
    (acc, { data }) => (data ? [data, ...acc] : acc),
    alliancesHubDelegations.data ? alliancesHubDelegations.data : []
  )
  const state = combineState(
    ...alliancesData,
    ...stakingParamsData,
    ...delegationsData,
    ...alliancesDelegationsData
  )

  const options = [
    ...Object.values(networks ?? {}).map(({ baseAsset, chainID }) => ({
      denom: baseAsset,
      rewards: 1,
      chainID,
      unbonding: getChainUnbondTime(unbondingtime[chainID]),
      isAlliance: false,
      stakeOnAllianceHub: false,
      hasDelegations: delegations.some(({ balance }) => {
        const isPositiveBalance =
          balance?.denom === baseAsset && Number(balance?.amount) > 0

        return isPositiveBalance
      }),
    })),
    ...(alliances ?? []).map(
      ({ denom, reward_weight, chainID, stakeOnAllianceHub }) => ({
        denom: denom,
        rewards: Number(reward_weight),
        chainID,
        unbonding: stakeOnAllianceHub
          ? 0
          : (unbondingtime[chainID] ?? 0) / 60 / 60 / 24,
        isAlliance: true,
        stakeOnAllianceHub: stakeOnAllianceHub,
        hasDelegations: alliancesDelegations.some(
          ({ chainID: delChainID, delegations }) => {
            const isSameID = delChainID === chainID
            const isPositiveBalance = delegations.some(
              (del: any) =>
                del.balance?.denom === denom && Number(del.balance?.amount) > 0
            )

            return isSameID && isPositiveBalance
          }
        ),
      })
    ),
  ]

  const tokenList = options.reduce((acc, { denom }) => {
    const token = readNativeDenom(denom)
    if (token.type === TokenType.IBC) return acc
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
      <header className={styles.quick__action}>
        <p>{t("Select staking asset")}:</p>
        <TokenSelector
          value={token}
          tokenLists={tokenList}
          onChange={setToken}
        />
      </header>
      <main className={styles.table__container}>
        <Table
          dataSource={options.filter(
            ({ denom }) =>
              !token ||
              readNativeDenom(denom).token === token ||
              readNativeDenom(denom).lsd === token
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
                              alt={network?.name}
                              className={styles.chain__icon}
                            />
                          )}
                        </div>
                        {token.symbol}

                        <span className={styles.alliance__logo}>
                          {network?.name}
                        </span>

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
                              <span className={styles.alliance__logo}>🤝</span>
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
              title: (
                <span>
                  {t("Unbonding period")}{" "}
                  <TooltipIcon
                    content={
                      <article>
                        <p>
                          When a delegator decides to undelegate their asset.
                        </p>
                        <p>No rewards accrue during this period.</p>
                        <p>This action cannot be stopped once executed.</p>
                      </article>
                    }
                  />
                </span>
              ),
              dataIndex: "unbonding",
              defaultSortOrder: "desc",
              sorter: ({ unbonding: a = 0 }, { unbonding: b = 0 }) => a - b,
              render: (value = 0) => t("{{value}} days", { value }),
              align: "right",
            },
            {
              title: t("Actions"),
              dataIndex: "actions",
              render: (
                _,
                {
                  denom,
                  chainID,
                  rewards,
                  unbonding,
                  isAlliance,
                  hasDelegations,
                  stakeOnAllianceHub,
                }
              ) => (
                <Flex start gap={8}>
                  <ModalButton
                    title={t("Staking Details")}
                    renderButton={(open) => (
                      <Button color="primary" size="small" onClick={open}>
                        {hasDelegations ? t("Manage Stake") : t("Stake")}
                      </Button>
                    )}
                  >
                    {quickStakeForm.render(
                      chainID,
                      denom,
                      balancesRes.data ?? [],
                      rewards,
                      unbonding,
                      isAlliance,
                      hasDelegations,
                      stakeOnAllianceHub
                    )}
                  </ModalButton>
                </Flex>
              ),
            },
          ]}
        />
      </main>
    </Page>
  )
}

export default QuickStake
