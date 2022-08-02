import { useTranslation } from "react-i18next"

import { combineState } from "data/query"
import { useDelegations, useUnbondings } from "data/queries/staking"
import { useRewards } from "data/queries/distribution"
import { Card, Col, Row } from "components/layout"
import { Fetching } from "components/feedback"
import { LinkButton } from "components/general"
import DelegationsPromote from "app/containers/DelegationsPromote"
import Delegations from "./Delegations"
import Unbondings from "./Unbondings"
import Rewards from "./Rewards"
import { isWallet } from "auth"
import PageLoading from "auth/modules/PageLoading"

const Staked = () => {
  const { t } = useTranslation()
  const { data: delegations, ...delegationsState } = useDelegations()
  const { data: unbondings, ...unbondingsState } = useUnbondings()
  const { data: rewards, ...rewardsState } = useRewards()
  const state = combineState(delegationsState, unbondingsState, rewardsState)

  const render = () => {
    if (!(delegations && unbondings && rewards))
      return isWallet.mobileNative() ? <PageLoading /> : null

    const staked =
      delegations.length || unbondings.length || rewards.total.toArray().length

    if (!staked) return <DelegationsPromote horizontal />

    return (
      <Row>
        {isWallet.mobile() && (
          <Col>
            <Card className="blankSidePad">
              <LinkButton to="/rewards" color="primary" size="small" block>
                {t("Withdraw all rewards")}
              </LinkButton>
            </Card>
          </Col>
        )}
        <Col>
          <Delegations />
        </Col>

        <Col>
          <Unbondings />
        </Col>

        <Col>
          <Rewards />
        </Col>
      </Row>
    )
  }

  return <Fetching {...state}>{render()}</Fetching>
}

export default Staked
