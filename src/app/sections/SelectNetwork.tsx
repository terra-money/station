import { useTranslation } from "react-i18next"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import { capitalize } from "@mui/material"
import { useNetworkOptions, useNetworkState } from "data/wallet"
import { Flex, Grid } from "components/layout"
import { RadioGroup } from "components/form"
import { ModalButton, Mode } from "components/feedback"
import { useCustomNetworks } from "data/settings/CustomNetworks"
import { InternalLink } from "components/general"
import styles from "./MobileItem.module.scss"
import classNames from "classnames/bind"

const cx = classNames.bind(styles)

const SelectNetwork = () => {
  const { t } = useTranslation()

  const [network, setNetwork] = useNetworkState()
  const networkOptions = useNetworkOptions()
  const { list } = useCustomNetworks()

  if (!networkOptions) return null

  return (
    <ModalButton
      modalType={Mode.SELECT}
      renderButton={(open) => (
        <div onClick={open}>
          <Flex>
            {capitalize(network)}
            <ArrowForwardIosIcon />
          </Flex>
        </div>
      )}
    >
      <Grid gap={0}>
        <RadioGroup
          options={networkOptions}
          value={network}
          onChange={setNetwork}
          mobileModal={true}
        />
        <div className={cx(styles.item, { topBorder: true })}>
          {list.length ? (
            <InternalLink to="/networks" chevron>
              {t("Manage networks")}
            </InternalLink>
          ) : (
            <InternalLink to="/network/new" chevron>
              {t("Add a network")}
            </InternalLink>
          )}
        </div>
      </Grid>
    </ModalButton>
  )
}

export default SelectNetwork
