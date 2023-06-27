import { ReactNode } from "react"
import classNames from "classnames/bind"
import { useTheme } from "data/settings/Theme"
import { Contacts as ContactProps } from "types/components"
import { ReactComponent as Discord } from "styles/images/community/Discord.svg"
import { ReactComponent as Telegram } from "styles/images/community/Telegram.svg"
import { ReactComponent as Twitter } from "styles/images/community/Twitter.svg"
import { ReactComponent as Github } from "styles/images/community/Github.svg"
import { ExternalLink } from "components/general"
import { Flex } from "components/layout"
import styles from "./Contacts.module.scss"

const cx = classNames.bind(styles)

const ICON_SIZE = { width: 18, height: 18 }

const icons: Record<string, ReactNode> = {
  discord: <Discord {...ICON_SIZE} />,
  telegram: <Telegram {...ICON_SIZE} />,
  twitter: <Twitter {...ICON_SIZE} />,
  github: <Github {...ICON_SIZE} />,
}

interface Props {
  contacts: ContactProps
  menu?: boolean
}

const Contacts = ({ contacts, menu }: Props) => {
  const { name } = useTheme()

  return (
    <Flex start className={cx(styles.wrapper, { menu })}>
      {Object.entries(contacts ?? {}).map(([key, href]) => {
        const icon = icons[key]
        return !icon ? null : (
          <ExternalLink
            href={href}
            className={`${styles.icon} ${
              name === "blossom" && styles.icon_white
            }`}
            key={key}
          >
            {icon}
          </ExternalLink>
        )
      })}
    </Flex>
  )
}

export default Contacts
