import { useTranslation } from "react-i18next"
import { ContractInfo } from "@terra-money/terra.js"
import { Pre, FinderLink } from "components/general"
import { Card, Grid } from "components/layout"
import ContractItemActions from "./ContractItemActions"
import styles from "./ContractDetails.module.scss"

const ContractDetails = (props: ContractInfo) => {
  const { t } = useTranslation()
  const { code_id, address, admin, creator, init_msg } = props

  const contents = [
    {
      title: t("Code ID"),
      content: code_id,
    },
    {
      title: t("Creator"),
      content: <FinderLink short>{creator}</FinderLink>,
    },
    {
      title: t("Admin"),
      content: admin && <FinderLink short>{admin}</FinderLink>,
    },
  ]

  return (
    <Card
      title={<FinderLink className={styles.link}>{address}</FinderLink>}
      extra={<ContractItemActions />}
      bordered
      mainClassName={styles.main}
    >
      <Grid gap={32}>
        <header className={styles.header}>
          {contents.map(({ title, content }) =>
            !content ? null : (
              <Grid gap={4} key={title}>
                <h1>{title}</h1>
                <p>{content}</p>
              </Grid>
            )
          )}
        </header>

        <Grid gap={4} className={styles.wrapper}>
          {/* Do not translate this */}
          <h1>InitMsg</h1>
          <Pre height={240}>{init_msg}</Pre>
        </Grid>
      </Grid>
    </Card>
  )
}

export default ContractDetails
