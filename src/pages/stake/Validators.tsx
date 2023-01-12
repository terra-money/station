/* FIXME(terra.js): Import from terra.js */
import { BondStatus } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import { bondStatusFromJSON } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import WithSearchInput from "pages/custom/WithSearchInput"
import styles from "./Validators.module.scss"
import ChainFilter from "components/layout/ChainFilter"
import ValidatorsList from "./ValidatorsList"
import { Page } from "components/layout"
import { useTranslation } from "react-i18next"

const Validators = () => {
  const { t } = useTranslation()

  return (
    <Page sub>
      <WithSearchInput
        gap={0}
        placeholder={t("Search for validator...")}
        padding
      >
        {(keyword: string) => (
          <ChainFilter outside className={styles.filter}>
            {(chainID?: string) => (
              <ValidatorsList keyword={keyword} chainID={chainID ?? ""} />
            )}
          </ChainFilter>
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
