import QuickStakeForm from "txs/stake/QuickStakeForm"
import { Tabs } from "components/layout"
import { TFunction } from "i18next"

export enum QuickStakeAction {
  DELEGATE = "Delegate",
  UNBOND = "Undelegate",
}

export const useQuickStakeForm = (t: TFunction) => {
  const render = (
    chainID: string,
    denom: string,
    balances: { denom: string; amount: string }[],
    rewardRate: number,
    unbondingTime: number,
    isAlliance: boolean,
    hasDelegations: boolean,
    stakeOnAllianceHub?: boolean
  ) => {
    const props = {
      balances,
      denom,
      chainID,
      rewardRate,
      unbondingTime,
      isAlliance,
      stakeOnAllianceHub,
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

  return {
    render,
  }
}
