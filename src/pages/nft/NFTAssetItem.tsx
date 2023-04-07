import { useTranslation } from "react-i18next"
import classNames from "classnames/bind"
import qs from "qs"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import ShortcutOutlinedIcon from "@mui/icons-material/ShortcutOutlined"
import { truncate } from "@terra-money/terra-utils"
import { getIpfsGateway, useTokenInfoCW721 } from "data/queries/wasm"
import { InternalButton, InternalLink } from "components/general"
import { Grid } from "components/layout"
import { WithFetching } from "components/feedback"
import { ModalButton } from "components/feedback"
import NFTDetails from "./NFTDetails"
import styles from "./NFTAssetItem.module.scss"

const cx = classNames.bind(styles)

interface Props {
  contract: TerraAddress
  id: string
  compact?: boolean
}

// Where to use
// 1. NFT asset list
// 2. Transfer tx form
const NFTAssetItem = ({ contract, id, compact }: Props) => {
  const { t } = useTranslation()
  const { data, ...state } = useTokenInfoCW721(contract, id)
  const SIZE = compact ? { width: 50, height: 50 } : { width: 100, height: 100 }
  const className = cx(styles.item, { compact })

  const renderPlaceholder = () => (
    <article className={className}>
      <div style={SIZE} className={cx(styles.image, styles.placeholder)} />
      <h1 className={styles.name}>{truncate(id)}</h1>
    </article>
  )

  const render = () => {
    if (!data) return null
    const { extension } = data
    const name = extension?.name ?? truncate(id)
    const image = extension?.image
    const src = getIpfsGateway(image)

    return (
      <article className={className}>
        {src && (
          <ModalButton
            title={name}
            renderButton={(open) => (
              <button type="button" onClick={open} className={styles.image}>
                <img src={src} alt="" {...SIZE} />
              </button>
            )}
          >
            <img src={src} alt="" className={styles.large} />
          </ModalButton>
        )}

        <h1 className={styles.name}>{name}</h1>

        {compact && (
          <>
            <ModalButton
              title={name}
              renderButton={(open) => (
                <InternalButton onClick={open} disabled={!extension}>
                  <InfoOutlinedIcon style={{ fontSize: 18 }} />
                  {t("View")}
                </InternalButton>
              )}
            >
              <Grid gap={12}>
                {src && <img src={src} alt="" className={styles.large} />}

                {extension && <NFTDetails data={extension} />}
              </Grid>
            </ModalButton>

            <InternalLink
              to={{
                pathname: "/nft/transfer/",
                search: qs.stringify({ contract, id }),
              }}
            >
              <ShortcutOutlinedIcon style={{ fontSize: 18 }} />
              {t("Send")}
            </InternalLink>
          </>
        )}
      </article>
    )
  }

  return (
    // skip loading indicator
    <WithFetching {...state}>
      {(progress, wrong) =>
        wrong ?? (progress ? renderPlaceholder() : render())
      }
    </WithFetching>
  )
}

export default NFTAssetItem
