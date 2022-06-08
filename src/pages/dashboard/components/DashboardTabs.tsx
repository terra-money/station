/*
 * @Author: lmk
 * @Date: 2022-05-25 11:23:10
 * @LastEditTime: 2022-06-08 12:03:41
 * @LastEditors: lmk
 * @Description:
 */
import { Box, Grid, Tab, Tabs, Button } from "@mui/material"
import { PropsWithChildren, SyntheticEvent, useState } from "react"
import styles from "./DashboardTabs.module.scss"
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined"
import { useAddress } from "data/wallet"
import { useConnectWallet } from "auth/hooks/useAddress"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import Delegations from "pages/stake/Delegations"
import Unbondings from "pages/stake/Unbondings"
import Rewards from "pages/stake/Rewards"
import { TooltipIcon } from "components/display"
import RewardsTooltip from "pages/stake/RewardsTooltip"
import { Read } from "components/token"
import { useCurrency } from "data/settings/Currency"
import { useBankBalance } from "data/queries/bank"
import { getAmount } from "utils/coin"
import { Link } from "react-router-dom"
import {
  calcDelegationsTotal,
  calcUnbondingsTotal,
  useDelegations,
  useUnbondings,
} from "data/queries/staking"
import { calcRewardsValues, useRewards } from "data/queries/distribution"
import { useTerraValidators } from "data/Terra/TerraAPI"
import { useMemoizedCalcValue } from "data/queries/oracle"
import { Col } from "components/layout"
import BigNumber from "bignumber.js"
// import { ValidatorLink } from "components/general"
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}
interface TabPanelProps {
  children?: React.ReactNode
  dir?: string
  index: number
  value: number
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
      className={styles.tabPanel}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  )
}
const ConnectBtn = () => {
  const { getAddress } = useConnectWallet()
  return (
    <Box sx={{ p: 2 }} className={styles.unConnectBox}>
      <div className={styles.unConnect}>
        <p className={styles.tips}>Connect to stake MIS and earn your reward</p>

        <Button
          className={styles.connect}
          onClick={getAddress}
          variant="contained"
        >
          Connect Now <ArrowForwardIosOutlinedIcon fontSize="small" />
        </Button>
      </div>
      <div className={styles.faqBox}>
        <Link to="/faq">
          <Button className={styles.faq} variant="outlined">
            FAQ <ArrowForwardIosOutlinedIcon fontSize="small" />
          </Button>
        </Link>
      </div>
    </Box>
  )
}
const DashboardTabs = ({ children }: PropsWithChildren<{}>) => {
  const [value, setValue] = useState(0)
  const address = useAddress()
  const { t } = useTranslation()
  const bankBalance = useBankBalance()
  const currency = useCurrency()
  const balance = getAmount(bankBalance, "umis")
  const navigate = useNavigate()
  // delegations list format
  const { data: delegations = [] } = useDelegations()
  const { data: unbondings = [] } = useUnbondings()
  const { data: rewards } = useRewards()
  const { data: TerraValidators = [] } = useTerraValidators()
  const calcValue = useMemoizedCalcValue()
  const validators = TerraValidators.map((item) => {
    const { operator_address, rewards_30d } = item
    const delegation = delegations.find(
      (item) => item.validator_address === operator_address
    )
    const unbonding = unbondings.find(
      (item) => item.validator_address === operator_address
    )
    const unbondingAmount = unbonding ? calcUnbondingsTotal([unbonding]) : "0"
    const { byValidator } = rewards
      ? calcRewardsValues(rewards, currency, calcValue)
      : { byValidator: [] }
    const reward = byValidator.find(
      ({ address }) => address === operator_address
    )
    const estimatedReward = rewards_30d
      ? new BigNumber(rewards_30d)
          .multipliedBy(100)
          .dividedBy(30)
          .multipliedBy(100000)
          .toFixed(6)
          .toString()
      : 0
    return {
      delegation: delegation?.balance.toData() || {
        amount: "0",
        denom: "umis",
      },
      unbonding: { amount: unbondingAmount, denom: "umis" },
      reward: { amount: reward?.sum || "0", denom: "umis" },
      name: item.description.moniker,
      address: item.operator_address,
      estimatedReward: { amount: estimatedReward || "0", denom: "umis" },
    }
  }).filter(
    (val) =>
      Number(val.delegation.amount) > 0 ||
      Number(val.unbonding.amount) > 0 ||
      Number(val.reward.amount) > 0
  )
  const handleChange = (event: SyntheticEvent<Element, Event>, value: any) => {
    setValue(value)
  }

  const goRewards = () => {
    navigate("/rewards")
  }
  const goReinvestAll = () => {
    navigate("/reinvestall")
  }

  const delegationstotal = calcDelegationsTotal(delegations)

  const unbondingsTotal = calcUnbondingsTotal(unbondings)
  const { total: rewardsTotal } = rewards
    ? calcRewardsValues(rewards, currency, calcValue)
    : { total: { sum: "0", list: [] } }
  const { sum: rewordTotal } = rewardsTotal
  const totalAmount = new BigNumber(delegationstotal)
    .plus(unbondingsTotal)
    .plus(rewordTotal)
    .plus(balance)
    .toString()
  if (!address) return <ConnectBtn />
  return (
    <>
      <Tabs
        value={value}
        onChange={handleChange}
        centered
        className={styles.tabBox}
        sx={{
          "& .MuiTabs-indicator": {
            backgroundColor: "#5D61FF",
            borderRadius: 2,
            height: 4,
            width: "9px !important",
            bottom: 4,
            left:
              value === 0
                ? `calc(25vw - 4px) !important`
                : `calc(75vw - 4px) !important`,
          },
        }}
      >
        <Tab
          label="Wallet"
          className={styles.tabItem}
          wrapped
          {...a11yProps(0)}
          sx={{
            "&.Mui-selected": {
              color: "#333",
              fontWeight: "bold",
              fontSize: "19px",
            },
          }}
        />
        <Tab
          label="Delegations"
          className={styles.tabItem}
          wrapped
          {...a11yProps(1)}
        />
      </Tabs>
      <TabPanel value={value} index={0}>
        <p className={styles.coinAmount}>
          Coin:
          <Read
            amount={totalAmount}
            denom={currency}
            className={styles.totalAmount}
            auto
          />
        </p>
        <Grid container className={styles.gridContainer}>
          <Grid item xs={6} className={styles.gridItem}>
            <div>
              <Read
                amount={balance}
                denom={currency}
                className={styles.value}
                auto
                block
              />
              <p className={styles.itemTitle}>Available</p>
            </div>
          </Grid>
          <Grid item xs={6} className={styles.gridItem}>
            <div>
              <Delegations />
              <p className={styles.itemTitle}>Delegating</p>
            </div>
          </Grid>
          <Grid item xs={6} className={styles.gridItem}>
            <div>
              <Rewards />
              <div className={styles.itemTitle}>
                <TooltipIcon content={<RewardsTooltip />} placement="bottom">
                  <p>Rewards</p>
                </TooltipIcon>
              </div>
            </div>
          </Grid>
          <Grid item xs={6} className={styles.gridItem}>
            <div>
              <Unbondings />
              <div className={styles.itemTitle}>
                <TooltipIcon
                  content={t(
                    "Maximum 7 undelegations can be in progress at the same time"
                  )}
                  placement="bottom"
                >
                  <p>Undelegating</p>
                </TooltipIcon>
              </div>
            </div>
          </Grid>
        </Grid>
        <Button
          className={styles.reinvest}
          variant="contained"
          onClick={() => goReinvestAll()}
        >
          Reinvest all rewards
        </Button>
        <Button
          className={styles.withdraw}
          variant="outlined"
          onClick={() => goRewards()}
        >
          {t("Withdraw all rewards")}
        </Button>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <div className={styles.myDelegations}>
          <p className={styles.title}>My Delegations</p>
          <Link to="/stake" className={styles.linkTo}>
            <span>View Validators to delegate</span>
            <ArrowForwardIosOutlinedIcon fontSize="small" />
          </Link>
        </div>
        <div className={styles.colBox}>
          <Col>
            {validators.length ? (
              validators.map((item) => {
                const {
                  delegation,
                  unbonding,
                  reward,
                  name,
                  address,
                  estimatedReward,
                } = item
                return (
                  <div key={address} className={styles.validator}>
                    <Link to={`/validator/${address}`}>
                      <p className={styles.validatorTitle}>{name}</p>
                    </Link>

                    <Grid container>
                      <Grid item xs={6} className={styles.validatorItem}>
                        <p className={styles.title}>Delegating</p>
                        <Read
                          amount={delegation.amount}
                          denom={delegation.denom}
                          className={styles.totalAmount}
                          auto
                        />
                      </Grid>
                      <Grid item xs={6} className={styles.validatorItem}>
                        <p className={styles.title}>Undelegating</p>
                        <Read
                          amount={unbonding.amount}
                          denom={unbonding.denom}
                          className={styles.totalAmount}
                          auto
                        />
                      </Grid>
                      <Grid item xs={6} className={styles.validatorItem}>
                        <p className={styles.title}>Rewards</p>
                        <Read
                          amount={reward.amount}
                          denom={reward.denom}
                          className={styles.totalAmount}
                          auto
                        />
                      </Grid>
                      <Grid item xs={6} className={styles.validatorItem}>
                        <p className={styles.title}>Estimated Reward/D</p>
                        <Read
                          amount={estimatedReward.amount}
                          denom={estimatedReward.denom}
                          className={styles.totalAmount}
                          auto
                        />
                      </Grid>
                    </Grid>
                  </div>
                )
              })
            ) : (
              <div className={styles.unConnect}>
                <img
                  src="./nothing@2x.png"
                  alt=""
                  width={56}
                  height={61}
                  style={{ marginBottom: 26 }}
                />
                <p className={styles.tips}>Stake MIS and earn rewards</p>
                <Link to="/stake">
                  <Button className={styles.connect} variant="contained">
                    Delegate Now{" "}
                    <ArrowForwardIosOutlinedIcon fontSize="small" />
                  </Button>
                </Link>
              </div>
            )}
          </Col>
        </div>
      </TabPanel>
      <div className={styles.faqBox}>
        <Link to="/faq">
          <Button className={styles.faq} variant="outlined">
            FAQ <ArrowForwardIosOutlinedIcon fontSize="small" />
          </Button>
        </Link>
      </div>
    </>
  )
}

export default DashboardTabs
