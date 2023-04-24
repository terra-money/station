import { readPercent } from "@terra-money/terra-utils"
import { Button } from "components/general"
import { Flex, Grid, Page, Table } from "components/layout"
import { useBalances } from "data/queries/bank"
import { useNativeDenoms } from "data/token"
import { useChainID, useNetwork } from "data/wallet"
import { useTranslation } from "react-i18next"
import QuickStakeForm from "txs/stake/QuickStakeForm"
import styles from "./QuickStake.module.scss"
import { ModalButton } from "components/feedback"
import { useAlliances } from "data/queries/alliance"
import { useStakingParams } from "data/queries/staking"
import { combineState } from "data/query"

export enum QuickStakeAction {
  DELEGATE = "Delegate",
  UNBOND = "Undelegate",
}

const QuickStake = () => {
  const renderQuickStakeForm = (
    chainID: string | undefined,
    action: string | undefined
  ) => {
    if (!(balances && chainID && action)) return null
    const props = {
      action,
      balances,
      chainID,
    }
    return <QuickStakeForm {...props} />
  }

  const { t } = useTranslation()
  const { data: balances } = useBalances()
  const readNativeDenom = useNativeDenoms()
  const networks = useNetwork()
  const chainID = useChainID()

  const { data: alliances, ...alliancesState } = useAlliances(chainID)
  const { data: stakingParams, ...stakingParamsState } =
    useStakingParams(chainID)
  const unbondingtime = stakingParams?.unbonding_time ?? 0
  const state = combineState(alliancesState, stakingParamsState)

  const options = [
    {
      denom: networks[chainID]?.baseAsset,
      rewards: 1,
      chainID,
      unbonding: unbondingtime / 60 / 60 / 24,
    },
    ...(alliances ?? []).map(({ denom, reward_weight }) => ({
      denom: denom ?? "",
      rewards: Number(reward_weight),
      chainID: "pisco-1",
      unbonding: unbondingtime / 60 / 60 / 24,
    })),
  ]

  return (
    <Page sub {...state}>
      <header className={styles.quick__action}>
        <div>Select asset to stake:</div>
        <ModalButton
          title={t("Quick Stake")}
          renderButton={(open) => (
            <Button color="primary" size="small" onClick={open}>
              Quick stake
            </Button>
          )}
        >
          {renderQuickStakeForm("phoenix-1", "Delegate")}
        </ModalButton>
      </header>
      <main className={styles.table__container}>
        <Table
          dataSource={options}
          rowKey={({ denom }) => denom}
          columns={[
            {
              title: t("Staking asset"),
              dataIndex: ["asset", "chainID"],
              render: (_, option) => {
                const { denom, chainID } = option
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
                        {token.name ?? token.symbol}
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
            {
              title: t("Actions"),
              dataIndex: [],
              render: () => (
                <Flex start gap={8}>
                  <Button color="primary" size="small">
                    Delegate
                  </Button>
                  <Button size="small">Undelegate</Button>
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
