import { useTranslation } from "react-i18next"
import { useCW721Tokens } from "data/queries/wasm"
import { ExternalLink } from "components/general"
import { Card } from "components/layout"
import { TokenIcon } from "components/token"
import NFTAssetItem from "./NFTAssetItem"
import styles from "./NFTAssetGroup.module.scss"

const NFTAssetGroup = (props: CW721ContractItem) => {
  const { contract, name, icon, marketplace } = props
  const { t } = useTranslation()
  const { data, ...state } = useCW721Tokens(contract)

  const title = (
    <>
      <TokenIcon
        token={contract}
        icon={icon}
        className={styles.icon}
        size={20}
      />
      {name}
    </>
  )

  const renderExtra = () => {
    if (!marketplace?.length) return null
    const [link] = marketplace
    return (
      <ExternalLink href={link} className={styles.link}>
        {t("Collection")}
      </ExternalLink>
    )
  }

  const render = () => {
    if (!data) return null
    const { tokens } = data
    if (!tokens.length) return null
    return tokens.map((id) => (
      <NFTAssetItem contract={contract} id={id} compact key={id} />
    ))
  }

  return (
    <Card
      {...state}
      title={title}
      extra={renderExtra()}
      className={styles.card}
      mainClassName={styles.main}
      size="small"
      bordered
      bg
    >
      {render()}
    </Card>
  )
}

export default NFTAssetGroup
