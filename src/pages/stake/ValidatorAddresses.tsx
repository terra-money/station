import { useTranslation } from "react-i18next"
import { bech32 } from "bech32"
import { ValAddress, AccAddress, Validator } from "@terra-money/terra.js"
import { FinderLink } from "components/general"
import { Card, Grid } from "components/layout"
import { ValidatorNumber } from "./components/ValidatorNumbers"
import styles from "./ValidatorAddresses.module.scss"

function fromValAddress(address: ValAddress): AccAddress {
  const vals = bech32.decode(address)
  return bech32.encode("mises", vals.words)
}

const ValidatorAddresses = ({ validator }: { validator: Validator }) => {
  const { t } = useTranslation()

  const { operator_address } = validator

  const addresses = [
    {
      title: t("Operator address"),
      content: <FinderLink validator>{operator_address}</FinderLink>,
    },
    {
      title: t("Wallet address"),
      content: <FinderLink>{fromValAddress(operator_address)}</FinderLink>,
    },
  ]

  return (
    <Card>
      <Grid gap={12} className={styles.addresses}>
        {addresses.map((item) => (
          <ValidatorNumber {...item} key={item.title} />
        ))}
      </Grid>
    </Card>
  )
}

export default ValidatorAddresses
