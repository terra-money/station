import { useTranslation } from "react-i18next"
import classNames from "classnames/bind"
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined"
import LockIcon from "@mui/icons-material/Lock"
import InfoIcon from "@mui/icons-material/Info"
import { capitalize } from "@mui/material"
import { readAmount } from "@terra.kitchen/utils"
import { themes } from "styles/themes/themes"
import { useAddress } from "data/wallet"
import { useThemeState, useValidateTheme } from "data/settings/Theme"
import { Flex, FlexColumn, Grid } from "components/layout"
import { Radio } from "components/form"
import { ModalButton } from "components/feedback"
import HeaderIconButton from "../components/HeaderIconButton"
import styles from "./SelectTheme.module.scss"

const cx = classNames.bind(styles)

const Selector = () => {
  const { t } = useTranslation()
  const [current, setTheme] = useThemeState()
  const validate = useValidateTheme()

  return (
    <Grid gap={28} columns={2}>
      {themes.map((theme) => {
        const { name, unlock, preview } = theme
        const active = current.name === name
        const unlocked = validate?.(theme)

        return (
          <Radio
            checked={active}
            label={capitalize(name)}
            className={cx({ active, locked: !unlocked })}
            onClick={() => unlocked && setTheme(theme)}
            disabled={!unlocked}
            key={name}
          >
            <div className={styles.wrapper}>
              <Flex className={styles.preview}>{preview}</Flex>

              {!unlocked && (
                <FlexColumn gap={4} className={styles.unlock}>
                  <LockIcon fontSize="small" />
                  <small>
                    {t("Stake {{amount}} Luna to unlock", {
                      amount: readAmount(unlock, { comma: true }),
                    })}
                  </small>
                </FlexColumn>
              )}
            </div>
          </Radio>
        )
      })}
    </Grid>
  )
}

const SelectTheme = () => {
  const { t } = useTranslation()
  const address = useAddress()
  const validate = useValidateTheme()

  return (
    <ModalButton
      title={t("Select theme")}
      renderButton={(open) => (
        <HeaderIconButton onClick={open}>
          <PaletteOutlinedIcon style={{ fontSize: 18 }} />
        </HeaderIconButton>
      )}
    >
      <Grid gap={20}>
        <Selector />

        {address && themes.some((theme) => !validate?.(theme)) && (
          <Flex gap={4} className={styles.info}>
            <InfoIcon style={{ fontSize: 18 }} />
            {t("Preview is available if wallet is disconnected")}
          </Flex>
        )}
      </Grid>
    </ModalButton>
  )
}

export default SelectTheme
