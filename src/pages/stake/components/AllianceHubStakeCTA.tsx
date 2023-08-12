import { useTranslation } from "react-i18next"
import { useQuickStakeForm } from "../hooks/useQuickStake"
import { Flex } from "components/layout"
import { ModalButton } from "components/feedback"
import { useBalances } from "data/queries/bank"
import { useChainID } from "data/wallet"
import { Button } from "components/general"
import styles from "./AllianceHubStakeCTA.module.scss"

interface AllianceHubStakeCTAProps {
  denom: string
}

const AllianceHubStakeCTA = (props: AllianceHubStakeCTAProps) => {
  // The following constants apply to all the
  // QuickStakeForm components in this file
  // because is staked throught alliance hub
  const unbonding = 0
  const isAlliance = true
  const hasDelegations = true
  const stakeOnAllianceHub = true
  const rewardsRate = 0

  // Contract: AllianceHubStakeCTA MUST be rendered with the intention
  // to interact with Terra Blockchains
  const chainID = useChainID()
  const { t } = useTranslation()
  const quickStakeForm = useQuickStakeForm(t)
  const balancesRes = useBalances()

  return (
    <span className={styles.AllianceHubStakeCTA}>
      <Flex start gap={8}>
        <ModalButton
          title={t("Staking Details")}
          renderButton={(open) => (
            <Button className={styles.AllianceHubStakeButton} onClick={open}>
              {t("Alliance Hub")}
            </Button>
          )}
        >
          {quickStakeForm.render(
            chainID,
            props.denom,
            balancesRes.data ?? [],
            rewardsRate,
            unbonding,
            isAlliance,
            hasDelegations,
            stakeOnAllianceHub
          )}
        </ModalButton>
      </Flex>
    </span>
  )
}

export default AllianceHubStakeCTA
