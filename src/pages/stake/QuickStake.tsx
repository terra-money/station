import { readPercent } from "@terra-money/terra-utils"
import { Button } from "components/general"
import { Flex, Grid, InlineFlex, Page, Table, Tabs } from "components/layout"
import { useBalances } from "data/queries/bank"
import { useNativeDenoms } from "data/token"
import { useNetworkWithFeature } from "data/wallet"
import { useTranslation } from "react-i18next"
import QuickStakeForm from "txs/stake/QuickStakeForm"
import styles from "./QuickStake.module.scss"
import { ModalButton } from "components/feedback"
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
import { Tooltip, TooltipIcon } from "components/display"
import { Delegation } from "@terra-money/feather.js"
import TokenSelector, {
  TokenInterface,
} from "components/form/Selectors/TokenSelector/TokenSelector"
import { useState } from "react"
import { ChainFeature } from "types/chains"
import { useIsLedger } from "utils/ledger"

export enum QuickStakeAction {
  DELEGATE = "Delegate",
  UNBOND = "Undelegate",
}

const QuickStake = () => {
  const renderQuickStakeForm = ({
    chainID,
    denom,
    rewardRate,
    unbondingTime,
    isAlliance,
    hasDelegations,
  }: {
    chainID: string
    denom: string
    rewardRate: number
    unbondingTime: number
    isAlliance: boolean
    hasDelegations: boolean
  }) => {
    if (!balances) return null

    const props = {
      balances,
      denom,
      chainID,
      rewardRate,
      unbondingTime,
      isAlliance,
    }

    const tabs = [
      {
        key: "delegate",
        tab: t("Stake"),
        children: (
          <QuickStakeForm {...props} action={QuickStakeAction.DELEGATE} />
        ),
      },
      {
        key: "undelegate",
        tab: t("Unstake"),
        children: (
          <QuickStakeForm {...props} action={QuickStakeAction.UNBOND} />
        ),
      },
    ]

    return hasDelegations ? (
      <Tabs tabs={tabs} type="line" state />
    ) : (
      <QuickStakeForm {...props} action={QuickStakeAction.DELEGATE} />
    )
  }

  const { t } = useTranslation()
  const { data: balances } = useBalances()
  const readNativeDenom = useNativeDenoms()
  const networks = useNetworkWithFeature(ChainFeature.STAKING)
  const [token, setToken] = useState<string | undefined>("uluna")
  const isLedger = useIsLedger()

  const alliancesData = useAllAlliances()
  const alliances = alliancesData.reduce(
    (acc, { data }) => (data ? [...acc, ...data] : acc),
    [] as AllianceDetails[]
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
    ...Object.values(networks ?? {}).map(({ baseAsset, chainID }) => ({
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
    if (token.type === "ibc") return acc
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
                              alt={network.name}
                              className={styles.chain__icon}
                            />
                          )}
                        </div>
                        {token.symbol}

                        <span className={styles.alliance__logo}>
                          {network.name}
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
              title: (
                <span>
                  {t("Rewards weight")}{" "}
                  <TooltipIcon
                    content={
                      <article>
                        <p>
                          The amount of rewards an Alliance asset accrues is
                          determined by the asset's Reward Weight.
                        </p>
                        <p>
                          This parameter is set by governance and represents the
                          maximum proportion of rewards an asset will earn.
                        </p>
                      </article>
                    }
                  />
                </span>
              ),
              dataIndex: "rewards",
              defaultSortOrder: "desc",
              sorter: ({ rewards: a = 0 }, { rewards: b = 0 }) => a - b,
              render: (rewards = 0) => readPercent(rewards),
              align: "right",
            },
            {
              title: t("Actions"),
              dataIndex: ["asset", "chainID"],
              render: (
                _,
                {
                  denom,
                  chainID,
                  rewards,
                  unbonding,
                  isAlliance,
                  hasDelegations,
                }
              ) => (
                <Flex start gap={8}>
                  <ModalButton
                    title={t("Staking Details")}
                    renderButton={(open) =>
                      isLedger && isAlliance ? (
                        <InlineFlex gap={4} start>
                          <Tooltip
                            content={
                              <article>
                                <p>
                                  {t(
                                    "Alliance is currently not supported on Ledger."
                                  )}
                                </p>
                              </article>
                            }
                          >
                            <Button size="small">Not available</Button>
                          </Tooltip>
                        </InlineFlex>
                      ) : (
                        <Button color="primary" size="small" onClick={open}>
                          {hasDelegations ? t("Manage Stake") : t("Stake")}
                        </Button>
                      )
                    }
                  >
                    {renderQuickStakeForm({
                      denom,
                      chainID,
                      rewardRate: rewards,
                      unbondingTime: unbonding,
                      isAlliance,
                      hasDelegations,
                    })}
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
