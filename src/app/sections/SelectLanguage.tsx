import { useTranslation } from "react-i18next"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import { capitalize } from "@mui/material"
import { Grid } from "components/layout"
import { RadioGroup } from "components/form"
import { ModalButton, Mode } from "components/feedback"
import HeaderIconButton from "app/components/HeaderIconButton"
import { Languages } from "config/lang"

const SelectLanguage = () => {
  const { i18n } = useTranslation()

  return (
    <ModalButton
      modalType={Mode.SELECT}
      renderButton={(open) => (
        <HeaderIconButton onClick={open}>
          {capitalize(i18n.language)}
          <ArrowForwardIosIcon />
        </HeaderIconButton>
      )}
    >
      <Grid gap={20}>
        <RadioGroup
          options={Object.values(Languages)}
          value={i18n.language}
          onChange={(language) => i18n.changeLanguage(language)}
          mobileModal={true}
        />
      </Grid>
    </ModalButton>
  )
}

export default SelectLanguage
