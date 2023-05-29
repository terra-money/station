import { useTranslation } from "react-i18next"
import DescriptionIcon from "@mui/icons-material/Description"
import BoltIcon from "@mui/icons-material/Bolt"
import { DOCUMENTATION, SETUP } from "config/constants"
import { ExternalLink } from "components/general"
import { Contacts } from "components/layout"
import styles from "./Links.module.scss"
import { capitalize } from "@mui/material"
import { useAddress } from "data/wallet"
import { useTheme } from "data/settings/Theme"

const Links = () => {
  const { t } = useTranslation()
  const isConnected = useAddress()
  const { name } = useTheme()

  const community = {
    discord: "https://terra.sc/discord",
    telegram: "https://t.me/TerraNetworkLobby",
    twitter: "https://twitter.com/terra_money",
    github: "https://github.com/terra-money/station",
  }

  return (
    <div className={styles.links}>
      <div
        className={`${styles.tutorial} ${
          name === "blossom" && styles.tutorial_white
        }`}
      >
        {!isConnected && (
          <ExternalLink href={SETUP} className={styles.link}>
            <BoltIcon style={{ fontSize: 18 }} />
            {capitalize(t("setup"))}
          </ExternalLink>
        )}
        <ExternalLink href={DOCUMENTATION} className={styles.link}>
          <DescriptionIcon style={{ fontSize: 18 }} />
          {capitalize(t("documentation"))}
        </ExternalLink>
      </div>

      <div className={styles.community}>
        <Contacts contacts={community} menu />
      </div>
    </div>
  )
}

export default Links
