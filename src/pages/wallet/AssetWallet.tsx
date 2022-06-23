import { useTranslation } from "react-i18next"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import is from "auth/scripts/is"
import { PeerMeta } from "auth/scripts/sessions"
import { ModalButton, Mode } from "components/feedback"
import { Button, InternalButton } from "components/general"
import { Card } from "components/layout"
import styles from "./AssetWallet.module.scss"
import { useSessionsState } from "../../auth/hooks/useSessions"

export interface Props {
  handshakeTopic: string
  peerMeta: PeerMeta
}

const AssetWallet = (props: Props) => {
  const { t } = useTranslation()
  const [, disconnectSession] = useSessionsState()

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
          modalType={is.mobile() ? Mode.BOTTOM_CONFIRM : Mode.DEFAULT}
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
              // close()
            }}
          >
            {t("Disconnect session")}
          </Button>
        </ModalButton>
      }
    />
  )
}

export default AssetWallet
