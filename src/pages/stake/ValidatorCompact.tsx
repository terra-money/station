import classNames from "classnames/bind"
import LaptopOutlinedIcon from "@mui/icons-material/LaptopOutlined"
import { useValidator } from "data/queries/staking"
import { ExternalLink, validateLink } from "components/general"
import { Card, Flex, Grid } from "components/layout"
import { ValidatorJailed, ValidatorStatus } from "./components/ValidatorTag"
import useAddressParams from "./useAddressParams"
import styles from "./ValidatorCompact.module.scss"
import ProfileIcon from "./components/ProfileIcon"
import { useTranslation } from "react-i18next"
import { readPercent } from "@terra-money/terra-utils"
import { DateTimeRenderer } from "components/display"

const cx = classNames.bind(styles)

const ValidatorCompact = ({ vertical }: { vertical?: boolean }) => {
  const address = useAddressParams()
  const { data: validator, ...state } = useValidator(address)
  const { t } = useTranslation()

  if (!validator) return null

  const { status, jailed, description, commission } = validator
  const { moniker, details, website } = description
  const { commission_rates, update_time } = commission
  const { max_change_rate, max_rate, rate } = commission_rates

  return (
    <Card {...state}>
      <Grid gap={16}>
        <header className={cx(styles.header, { vertical })}>
          <ProfileIcon src={validator.description.identity} size={60} />

          <Grid gap={4}>
            <Flex gap={10} start>
              <h1 className={styles.moniker}>{moniker}</h1>
              <ValidatorStatus status={status} />
              {jailed && <ValidatorJailed />}
            </Flex>

            {validateLink(website) && (
              <Flex gap={4} className={styles.link} start>
                <LaptopOutlinedIcon fontSize="inherit" />
                <ExternalLink href={website}>{website}</ExternalLink>
              </Flex>
            )}
          </Grid>
        </header>

        {details && <p>{details}</p>}
      </Grid>

      <div className={styles.validator__details__container}>
        <dl>
          <dt>{t("Current Commission")}</dt>
          <dd>{readPercent(Number(rate))}</dd>
        </dl>
        <dl>
          <dt>{t("Max Commission")}</dt>
          <dd>{readPercent(Number(max_rate))}</dd>
        </dl>
        <dl>
          <dt>{t("Max daily change")}</dt>
          <dd>{readPercent(Number(max_change_rate))}</dd>
        </dl>
        <dl>
          <dt>{t("Last changed")}</dt>
          <dd>
            <DateTimeRenderer format={"localestring"}>
              {update_time}
            </DateTimeRenderer>
          </dd>
        </dl>
      </div>
    </Card>
  )
}

export default ValidatorCompact
