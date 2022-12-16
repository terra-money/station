import { useTranslation } from "react-i18next"
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined"
import ChevronRight from "@mui/icons-material/ChevronRight"
import { InternalLink } from "components/general"
import { Card, Flex, Grid } from "components/layout"
import styles from "./DelegationsPromote.module.scss"

const DelegationsPromote = ({ horizontal }: { horizontal?: boolean }) => {
  const { t } = useTranslation()

  return (
    <Card>
      <article className={horizontal ? styles.horizontal : styles.vertical}>
        <Flex>
          <PaymentsOutlinedIcon style={{ fontSize: 56 }} />
        </Flex>

        <section className={styles.main}>
          <h1 className={styles.title}>{t("Staking rewards")}</h1>

          <Grid gap={8}>
            <p>{t("Stake native tokens and earn rewards")}</p>

            {!horizontal && (
              <InternalLink to="/stake">
                {t("Delegate now")}
                <ChevronRight fontSize="inherit" />
              </InternalLink>
            )}
          </Grid>
        </section>
      </article>
    </Card>
  )
}

export default DelegationsPromote
