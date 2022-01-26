import { useTranslation } from "react-i18next"
import semver from "semver"
import DownloadIcon from "@mui/icons-material/Download"
import { Card, Grid } from "components/layout"
import Overlay from "./components/Overlay"
import styles from "./ElectronVersion.module.scss"

declare global {
  interface Window {
    electron: any
  }
}

const electron = window.electron?.sendSync
const REQUIRED_VERSION = "1.2.0"

const links = [
  {
    title: "Windows",
    list: [
      {
        label: "Installer",
        link: "https://github.com/terra-money/station-desktop/releases/download/v1.2.0/Terra.Station.Setup.1.2.0.exe",
      },
    ],
  },
  {
    title: "Mac",
    list: [
      {
        label: "Apple silicon",
        link: "https://github.com/terra-money/station-desktop/releases/download/v1.2.0/Terra.Station-1.2.0-arm64.dmg",
      },
      {
        label: "Intel chip",
        link: "https://github.com/terra-money/station-desktop/releases/download/v1.2.0/Terra.Station-1.2.0.dmg",
      },
    ],
  },
  {
    title: "Linux",
    list: [
      {
        label: "Debian",
        link: "https://github.com/terra-money/station-desktop/releases/download/v1.2.0/Terra.Station_1.2.0_amd64.deb",
      },
      {
        label: "Red hat",
        link: "https://github.com/terra-money/station-desktop/releases/download/v1.2.0/Terra.Station-1.2.0.x86_64.rpm",
      },
    ],
  },
]

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
