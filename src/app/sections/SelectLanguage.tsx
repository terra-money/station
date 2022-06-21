import { useTranslation } from "react-i18next"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import { capitalize } from "@mui/material"
import { Grid, Flex } from "components/layout"
import { RadioGroup } from "components/form"
import { ModalButton, Mode } from "components/feedback"
import { Languages } from "config/lang"

const SelectLanguage = () => {
  const { i18n } = useTranslation()

  return (
    <ModalButton
      modalType={Mode.SELECT}
      renderButton={(open) => (
        <div onClick={open}>
          <Flex>
            {capitalize(i18n.language)}
            <ArrowForwardIosIcon />
          </Flex>
        </div>
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
