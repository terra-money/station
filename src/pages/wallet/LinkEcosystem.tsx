import { useTranslation } from "react-i18next"
import CallMadeIcon from "@mui/icons-material/CallMade"
import { ReactComponent as Logo } from "styles/images/TerraLine.svg"
import { Card, Flex, Grid } from "components/layout"

const LinkEcosystem = () => {
  const { t } = useTranslation()

  return (
    <Card href="https://terra.money/ecosystem">
      <Flex start gap={16}>
        <Logo width={40} height={40} />
        <Grid style={{ flex: 1 }} gap={4}>
          <h1>{t("Explore the Ecosystem")}</h1>
          <p className="small">{t("Try out various dApps built on Terra")}</p>
        </Grid>
        <CallMadeIcon />
      </Flex>
    </Card>
  )
}

export default LinkEcosystem
