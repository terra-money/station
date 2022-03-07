import { useTranslation } from "react-i18next"
import Logo from "styles/images/LocalTerra.png"
import { useNetworkState } from "data/wallet"
import { Button, ExternalLink } from "components/general"
import { FlexColumn } from "components/layout"
import styles from "./NetworkError.module.scss"

const NetworkError = () => {
  const { t } = useTranslation()
  const [network, setNetwork] = useNetworkState()

  const isLocalTerra = network === "localterra"

  return (
    <FlexColumn gap={20}>
      <img src={Logo} alt={t("Logo")} width={60} height={60} />

      <article>
        <h1 className={styles.title}>
          {network === "mainnet"
            ? t("Too many request. Try again later.")
            : isLocalTerra
            ? t("LocalTerra is not running")
            : t(`${network} is not running`)}
        </h1>

        {isLocalTerra && (
          <ExternalLink href="https://github.com/terra-money/localterra">
            {t("Learn more")}
          </ExternalLink>
        )}
      </article>

      {network === "mainnet" ? (
        <Button onClick={() => window.location.reload()} size="small" outline>
          {t("Refresh")}
        </Button>
      ) : (
        <Button onClick={() => setNetwork("mainnet")} size="small" outline>
          {t("Back to mainnet")}
        </Button>
      )}
    </FlexColumn>
  )
}

export default NetworkError
