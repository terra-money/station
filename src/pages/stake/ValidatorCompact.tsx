import classNames from "classnames/bind"
import LaptopOutlinedIcon from "@mui/icons-material/LaptopOutlined"
import { useValidator } from "data/queries/staking"
import { ExternalLink, validateLink } from "components/general"
import { Card, Flex, Grid } from "components/layout"
import { ValidatorJailed, ValidatorStatus } from "./components/ValidatorTag"
import useAddressParams from "./useAddressParams"
import styles from "./ValidatorCompact.module.scss"
import ProfileIcon from "./components/ProfileIcon"

const cx = classNames.bind(styles)

const ValidatorCompact = ({ vertical }: { vertical?: boolean }) => {
  const address = useAddressParams()
  const { data: validator, ...state } = useValidator(address)

  if (!validator) return null

  const { status, jailed, description } = validator
  const { moniker, details, website } = description

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
    </Card>
  )
}

export default ValidatorCompact
