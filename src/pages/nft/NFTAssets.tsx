import { useTranslation } from "react-i18next"
import classNames from "classnames/bind"
import { useAddress } from "data/wallet"
import { useCustomTokensCW721 } from "data/settings/CustomTokens"
import { InternalButton } from "components/general"
import { Col, Card, Grid } from "components/layout"
import { ModalButton, Mode } from "components/feedback"
import ManageCustomTokensCW721 from "../custom/ManageCustomTokensCW721"
import NFTPlaceholder from "./NFTPlaceholder"
import NFTAssetGroup from "./NFTAssetGroup"
import styles from "./NFTAssets.module.scss"
import { isWallet } from "auth"

const cx = classNames.bind(styles)

const NFTAssets = () => {
  const { t } = useTranslation()
  const address = useAddress()
  const { list } = useCustomTokensCW721()
  const empty = !address || !list.length

  const renderExtra = (render: boolean, empty: boolean = true) => (
    <ModalButton
      title={t("NFT")}
      modalType={isWallet.mobile() ? Mode.FULL_CARD : Mode.DEFAULT}
      renderButton={(open) => {
        if (!render) return null

        return (
          <InternalButton onClick={open} chevron>
            {(!isWallet.mobile() || (isWallet.mobile() && empty)) &&
              t("Add tokens")}
          </InternalButton>
        )
      }}
    >
      <ManageCustomTokensCW721 />
    </ModalButton>
  )

  return (
    <>
      {isWallet.mobile() && !empty && (
        <Card title={"Manage list"} extra={renderExtra(true, empty)} />
      )}
      <Card
        extra={!isWallet.mobile() && renderExtra(!empty)}
        className={isWallet.mobile() && !empty ? "blank" : ""}
      >
        <Grid gap={16} className={cx({ placeholder: empty })}>
          {empty ? (
            <NFTPlaceholder />
          ) : (
            <Col>
              {list.map((item) => (
                <NFTAssetGroup {...item} key={item.contract} />
              ))}
            </Col>
          )}

          {/* To maintain the modal even if empty is false when add an NFT */}
          {renderExtra(empty)}
        </Grid>
      </Card>
    </>
  )
}

export default NFTAssets
