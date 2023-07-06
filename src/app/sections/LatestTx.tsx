import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { intervalToDuration } from "date-fns"
import DoneAllIcon from "@mui/icons-material/DoneAll"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import CloseIcon from "@mui/icons-material/Close"
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen"
import { isTxError, TxInfo } from "@terra-money/feather.js"
import * as ruleset from "@terra-money/log-finder-ruleset"
import useInterval from "utils/hooks/useInterval"
import { isBroadcastingState, latestTxState } from "data/queries/tx"
import { useTxInfo } from "data/queries/tx"
import { useThemeAnimation } from "data/settings/Theme"
import { useNetworkName } from "data/wallet"
import { Button, FinderLink, LinkButton } from "components/general"
import { Modal, LoadingCircular } from "components/feedback"
import { createAmplitudeClient } from "utils/analytics/setupAmplitude"
import { Flex } from "components/layout"
import TxMessage from "../containers/TxMessage"
import styles from "./LatestTx.module.scss"
import { AnalyticsEvent } from "utils/analytics"

const { createActionRuleSet, getTxCanonicalMsgs, createLogMatcherForActions } =
  ruleset

enum Status {
  LOADING = "LOADING",
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
}

const TxIndicator = ({ txhash }: { txhash: string }) => {
  const amplitude = createAmplitudeClient()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const animation = useThemeAnimation()

  const [latestTx, setLatestTx] = useRecoilState(latestTxState)
  const [minimized, setMinimized] = useState(false)
  const initLatestTx = () => setLatestTx({ txhash: "", chainID: "" })
  const { redirectAfterTx, chainID, onSuccess } = latestTx

  /* polling */
  const { data, isSuccess } = useTxInfo(latestTx)

  /* context */
  const time = useTimeText(!isSuccess)

  /* status */
  const status = !data
    ? Status.LOADING
    : isTxError(data)
    ? Status.FAILURE
    : Status.SUCCESS

  useEffect(() => {
    status === Status.SUCCESS && onSuccess?.()
  }, [status, onSuccess])

  useEffect(() => {
    if (status !== Status.LOADING) {
      amplitude.trackEvent(AnalyticsEvent.TRANSACTION, { status })
    }
  }, [status, amplitude])

  /* render component */
  const icon = {
    [Status.LOADING]: <LoadingCircular size={36} thickness={2} />,
    [Status.SUCCESS]: (
      <DoneAllIcon className={styles.success} style={{ fontSize: 40 }} />
    ),
    [Status.FAILURE]: (
      <WarningAmberIcon className={styles.danger} style={{ fontSize: 40 }} />
    ),
  }[status]

  const title = {
    [Status.LOADING]: t("Queued"),
    [Status.SUCCESS]: t("Success!"),
    [Status.FAILURE]: t("Failed"),
  }[status]

  const txLink = (
    <FinderLink chainID={chainID} tx short>
      {txhash}
    </FinderLink>
  )

  const hashDetails = (
    <section className={styles.details}>
      {status === Status.LOADING && (
        <aside className={styles.queued}>
          <header>
            <h1>{t("Queued")}</h1>
            <h2>{time}</h2>
          </header>

          <p>{t("Transaction is processing")}</p>
        </aside>
      )}

      <section className={styles.hash}>
        <h1>{t("Tx hash")}</h1>
        {txLink}
      </section>
    </section>
  )

  /* parse tx log */
  const networkName = useNetworkName()
  const ruleset = createActionRuleSet(networkName)
  const logMatcher = createLogMatcherForActions(ruleset)
  const getCanonicalMsgs = (txInfo: TxInfo) => {
    // @ts-expect-error
    const matchedMsg = getTxCanonicalMsgs(txInfo, logMatcher)
    return matchedMsg
      ? matchedMsg
          .map((matchedLog) => matchedLog.map(({ transformed }) => transformed))
          .flat(2)
      : []
  }

  return minimized ? (
    <div className={styles.minimized} onClick={() => setMinimized(false)}>
      {status !== Status.LOADING && (
        <button type="button" className={styles.close} onClick={initLatestTx}>
          <CloseIcon fontSize="small" />
        </button>
      )}

      <Flex className={styles.icon}>{icon}</Flex>

      <section className={styles.main}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.link}>{txLink}</p>
      </section>
    </div>
  ) : status === Status.LOADING ? (
    <Modal
      icon={<img src={animation} width={100} height={100} alt="" />}
      closeIcon={<CloseFullscreenIcon fontSize="inherit" />}
      title={t("Broadcasting transaction")}
      isOpen={!minimized}
      onRequestClose={() => setMinimized(true)}
    >
      {hashDetails}
    </Modal>
  ) : (
    <Modal
      icon={icon}
      closeIcon={false}
      title={title}
      footer={() =>
        redirectAfterTx ? (
          <LinkButton
            to={redirectAfterTx.path}
            onClick={initLatestTx}
            color="primary"
            block
          >
            {redirectAfterTx.label}
          </LinkButton>
        ) : (
          <Button onClick={initLatestTx} color="primary" block>
            {t("Confirm")}
          </Button>
        )
      }
      isOpen={!minimized}
      onRequestClose={() => {
        initLatestTx()
        if (redirectAfterTx) navigate(redirectAfterTx.path)
      }}
      maxHeight
    >
      {data && (
        <ul className={styles.messages}>
          {
            // TODO: update getCanonicalMsgs() to support station.js types
            getCanonicalMsgs(data).map((msg, index) => {
              if (!msg) return null
              const { canonicalMsg } = msg
              return (
                <li key={index}>
                  {canonicalMsg.map((msg, index) => (
                    <TxMessage key={index}>{msg}</TxMessage>
                  ))}
                </li>
              )
            })
          }
        </ul>
      )}

      {hashDetails}
    </Modal>
  )
}

const LatestTx = () => {
  const { txhash } = useRecoilValue(latestTxState)
  const setIsBroadcasting = useSetRecoilState(isBroadcastingState)

  useEffect(() => {
    setIsBroadcasting(!!txhash)
  }, [setIsBroadcasting, txhash])

  return !txhash ? null : <TxIndicator txhash={txhash} key={txhash} />
}

export default LatestTx

/* helper */
const useTimeText = (run: boolean) => {
  const start = useMemo(() => new Date(), [])
  const [now, setNow] = useState(new Date())

  useInterval(() => setNow(new Date()), run ? 1000 : null)

  const { minutes, seconds } = intervalToDuration({ start, end: now })
  return [minutes, seconds].map((str) => String(str).padStart(2, "0")).join(":")
}
