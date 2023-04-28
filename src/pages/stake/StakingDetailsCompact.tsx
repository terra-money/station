import classNames from "classnames/bind"
import { Card, Flex, Grid, InlineFlex } from "components/layout"
import styles from "./QuickStake.module.scss"
import { useNativeDenoms } from "data/token"
import { useNetwork } from "data/wallet"
import { Tooltip } from "components/display"
import { useTranslation } from "react-i18next"

const cx = classNames.bind(styles)

const ValidatorCompact = ({
  vertical,
  denom,
  chainID,
}: {
  vertical?: boolean
  denom: string
  chainID: string
}) => {
  const network = useNetwork()
  const { t } = useTranslation()
  const readNativeDenom = useNativeDenoms()
  const token = readNativeDenom(denom)
  const isAlliance = denom !== network[chainID].baseAsset

  return (
    <Card>
      <Grid gap={16}>
        <header className={cx(styles.header, { vertical })}>
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
                  src={network[chainID].icon}
                  alt={network[chainID].name}
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
                  <span className={styles.alliance__logo}>🤝</span>
                </Tooltip>
              </InlineFlex>
            )}
          </Flex>
        </header>
      </Grid>
    </Card>
  )
}

export default ValidatorCompact
