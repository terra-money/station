import { useTranslation } from "react-i18next"
import semver from "semver"
import DownloadIcon from "@mui/icons-material/Download"
import { Card, Grid } from "components/layout"
import Overlay from "./components/Overlay"
import electron, { links } from "./electron"
import styles from "./ElectronVersion.module.scss"

const REQUIRED_VERSION = "1.2.0"

const ElectronVersion = () => {
  const { t } = useTranslation()
  if (!electron) return null

  const version = electron("version")
  const shouldUpdate = semver.lt(version, REQUIRED_VERSION)

  if (!shouldUpdate) return null
  return (
    <Overlay>
      <Grid gap={8}>
        <h1 className={styles.title}>{t("Update required")}</h1>

        <div className={styles.grid}>
          {links.map(({ title, list }) => (
            <Card
              title={title}
              className={styles.card}
              size="small"
              bordered
              key={title}
            >
              <ul>
                {list.map(({ label, link }) => (
                  <li key={link}>
                    <a href={link} className={styles.link} download>
                      <DownloadIcon fontSize="small" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Grid>
    </Overlay>
  )
}

export default ElectronVersion
