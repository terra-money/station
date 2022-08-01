import { useEffect, useLayoutEffect, useState, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { useTranslation } from "react-i18next"
import { truncate } from "@terra.kitchen/utils"
import { Pre } from "components/general"
import { Card, FlexColumn, Grid } from "components/layout"
import { Form, FormError, FormHelp } from "components/form"
import { RN_APIS, TxRequest, WebViewMessage } from "utils/rnModule"
import useAuth from "auth/hooks/useAuth"
import { isBroadcastingState, latestTxState } from "data/queries/tx"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen"
import { isWallet } from "auth"
import { LoadingCircular, Modal, Mode } from "components/feedback"
import { useThemeAnimation } from "data/settings/Theme"
import styles from "components/layout/Card.module.scss"
import { useIsClassic } from "../../data/query"
import { AccAddress, Tx } from "@terra-money/terra.js"

interface DeviceInterface {
  name: string
  id: string
}

const SelectLedgerForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { state }: { state: any } = useLocation()
  const animation = useThemeAnimation()
  const setLatestTx = useSetRecoilState(latestTxState)
  const isBroadcasting = useRecoilValue(isBroadcastingState)
  const {
    wallet,
    validatePassword,
    isUseBio,
    decodeBioAuthKey,
    createSignatureWithLedger,
    ...auth
  } = useAuth()

  const [tx, setTx] = useState<TxRequest>()
  const [sign, setSign] = useState<{ signTx: string; address: AccAddress }>()
  const [ledgers, setLedgers] = useState<DeviceInterface[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTxLoading, setIsTxLoading] = useState(false)
  const [signature, setSignature] = useState<string>()
  const [error, setError] = useState<Error>()
  const isClassic = useIsClassic()

  const ledgerCount = useRef(10)
  const getLedgerTimeout = useRef()

  useEffect(() => {
    if (state) {
      const data = JSON.parse(state)
      if (data.hasOwnProperty("signTx")) {
        setSign(data)
      } else
        setTx({
          ...data,
          tx: data.params ? data.params : data.tx,
        })
    }
  }, [state, isClassic])

  useLayoutEffect(() => {
    setIsLoading(true)
    // @ts-ignore
    getLedgerTimeout.current = setTimeout(async function run() {
      if (ledgerCount.current === 0) {
        clearGetLedgers()
        setIsLoading(false)
      } else {
        ledgerCount.current--
        setError(undefined)
        try {
          const ledgers: any = await WebViewMessage(RN_APIS.GET_LEDGER_LIST)
          if (typeof ledgers === "string" && ledgers?.includes("Error")) {
            // @ts-ignore
            setError({ message: ledgers })
            clearGetLedgers()
            setIsLoading(false)
          } else {
            // @ts-ignore
            if (ledgers.length > 0) {
              setLedgers(ledgers)
              setIsLoading(false)
              clearGetLedgers()
            } else {
              setTimeout(run, 2000)
            }
          }
        } catch (error) {
          setError(error as Error)
          clearGetLedgers()
          setIsLoading(false)
        }
      }
    }, 2000)

    const clearGetLedgers = () => {
      clearTimeout(getLedgerTimeout.current)
    }

    return () => {
      setLedgers([])
    }
  }, [])

  if (isLoading) {
    return (
      <FlexColumn gap={20} className={styles.screen}>
        <LoadingCircular size={36} />
        <p>Ready to Connect</p>
      </FlexColumn>
    )
  }

  if (signature) {
    return (
      <Modal
        modalType={Mode.FULL}
        title={t("Signature")}
        isOpen
        onRequestClose={() => {
          setSignature(undefined)
          navigate("/wallet")
        }}
      >
        <Pre normal break copy>
          {signature}
        </Pre>
      </Modal>
    )
  }

  return isTxLoading ? (
    <Modal
      modalType={isWallet.mobile() ? Mode.LOADING : Mode.DEFAULT}
      icon={<img src={animation} width={100} height={100} alt="" />}
      closeIcon={<CloseFullscreenIcon fontSize="inherit" />}
      title={t("Confirm in your Ledger")}
      isOpen
    >
      {""}
    </Modal>
  ) : (
    <Form>
      {error && (
        <Card className="blankSidePad">
          <FormError>{error.message}</FormError>
        </Card>
      )}
      {!!ledgers.length ? (
        tx || sign ? (
          ledgers?.map((item, idx) => (
            <Card
              key={item.id}
              title={item.name}
              disabled={isBroadcasting}
              extra={<ArrowForwardIosIcon className={styles.mobileExtra} />}
              onClick={
                isBroadcasting
                  ? undefined
                  : async () => {
                      setIsTxLoading(true)
                      setError(undefined)
                      try {
                        let result: any = null
                        if (tx) {
                          result = await auth.post(tx.tx, item.id)
                        }

                        if (sign) {
                          result = await createSignatureWithLedger(
                            item.id,
                            sign.signTx,
                            sign.address
                          )
                        }

                        // @ts-ignore
                        if (
                          typeof result === "string" &&
                          result?.includes("Error")
                        ) {
                          // @ts-ignore
                          setError({ message: result })
                          setIsTxLoading(false)
                          return
                        } else {
                          if (tx) {
                            setLatestTx({
                              txhash: result.txhash,
                              redirectAfterTx: {
                                label: "Confirm",
                                path: "/wallet",
                              },
                            })

                            if (tx?.handshakeTopic) {
                              await WebViewMessage(RN_APIS.APPROVE_TX, {
                                id: tx.id,
                                handshakeTopic: tx.handshakeTopic,
                                result: result.txhash,
                              })
                            }
                            navigate("/wallet")
                          }

                          if (sign) {
                            setSignature(result)
                          }
                        }
                      } catch (error) {
                        setIsTxLoading(false)
                        setError(error as Error)
                        // navigate("/wallet")
                      } finally {
                        setIsTxLoading(false)
                      }
                    }
              }
            >
              {truncate(item.id)}
            </Card>
          ))
        ) : (
          ledgers?.map((item, idx) => (
            <Card
              key={item.id}
              title={item.name}
              extra={<ArrowForwardIosIcon className={styles.mobileExtra} />}
              onClick={() => {
                navigate("/auth/ledger/add", {
                  state: ledgers[idx],
                })
              }}
            >
              {truncate(item.id)}
            </Card>
          ))
        )
      ) : (
        <Card className="blankSidePad">
          <Grid gap={4}>
            <FormError>No ledgers</FormError>
            <FormHelp>
              {t("If you still can't find list, check your app permissions.")}
            </FormHelp>
          </Grid>
        </Card>
      )}
    </Form>
  )
}

export default SelectLedgerForm
