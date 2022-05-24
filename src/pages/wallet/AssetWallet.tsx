import { useTranslation } from "react-i18next"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import is from "auth/scripts/is"
import { disconnectSession, PeerMeta } from "auth/scripts/sessions"
import { ModalButton, Mode, useModal } from "components/feedback"
import { Button, InternalButton } from "components/general"
import { Card } from "components/layout"
import styles from "./AssetWallet.module.scss"

export interface Props {
  handshakeTopic: string
  peerMeta: PeerMeta
}

const AssetWallet = (props: Props) => {
  const { t } = useTranslation()
  const close = useModal()

  const {
    handshakeTopic,
    peerMeta: { name, url, icons },
  } = props

  return (
    <Card
      className={styles.asset}
      title={
        <section className={styles.wrapper}>
          <div className={styles.title}>
            <img src={icons?.[0] || ""} alt={name} />
            <h1>{name}</h1>
          </div>
          <p className={styles.value}>{url}</p>
        </section>
      }
      extra={
        <ModalButton
          modalType={is.mobile() ? Mode.BOTTOM : Mode.DEFAULT}
          title={"ss"}
          renderButton={(open) => (
            <InternalButton
              icon={<ArrowForwardIosIcon style={{ fontSize: 12 }} />}
              onClick={open}
            ></InternalButton>
          )}
          maxHeight={false}
          cancelButton={{
            name: t("Cancel"),
            type: "default",
          }}
        >
          <Button
            block
            color="danger"
            onClick={async () => {
              await disconnectSession(handshakeTopic)
              close()
            }}
          >
            {t("Disconnect {{name}}", { name })}
          </Button>
        </ModalButton>
      }
    />
  )
}

export default AssetWallet
