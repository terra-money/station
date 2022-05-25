import { useEffect, useLayoutEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSetRecoilState } from "recoil"
import { useTranslation } from "react-i18next"
import { truncate } from "@terra.kitchen/utils"
import { Card } from "components/layout"
import styles from "components/layout/Card.module.scss"
import { Form, FormError } from "components/form"
import { parseTx, RN_APIS, WebViewMessage } from "utils/rnModule"
import useAuth from "auth/hooks/useAuth"
import { latestTxState } from "data/queries/tx"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen"
import { isWallet } from "auth"
import { LoadingCircular, Modal, Mode } from "components/feedback"
import { useThemeAnimation } from "data/settings/Theme"
import { CreateTxOptions } from "@terra-money/terra.js/dist/client/lcd/api/TxAPI"

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
  const { wallet, validatePassword, isUseBio, decodeBioAuthKey, ...auth } =
    useAuth()

  const [tx, setTx] = useState<CreateTxOptions>()
  const [ledgers, setLedgers] = useState<DeviceInterface[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTxLoading, setIsTxLoading] = useState(false)
  const [error, setError] = useState<Error>()

  const getLedgers = async () => {
    setIsLoading(true)
    setError(undefined)
    try {
      const ledgers: any = await WebViewMessage(RN_APIS.GET_LEDGER_LIST)
      if (typeof ledgers === "string" && ledgers?.includes("Error")) {
        // @ts-ignore
        setError({ message: ledgers })
      } else {
        console.log("getLedgers", ledgers)
        // @ts-ignore
        setLedgers(ledgers)
      }
    } catch (error) {
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (state) {
      const tx = parseTx(JSON.parse(state))
      console.log(tx)
      setTx(tx)
    }
  }, [state])

  useLayoutEffect(() => {
    getLedgers()
    return () => {
      setLedgers([])
    }
  }, [])

  if (isLoading) {
    return <LoadingCircular size={18} />
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
        <Card className="blankWithPad">
          <FormError>{error.message}</FormError>
        </Card>
      )}
      {!!ledgers.length ? (
        tx ? (
          ledgers?.map((item, idx) => (
            <Card
              key={item.id}
              title={item.name}
              extra={<ArrowForwardIosIcon className={styles.mobileExtra} />}
              onClick={async () => {
                console.log(tx)
                setIsTxLoading(true)
                setError(undefined)
                try {
                  const result: any = await auth.post(tx, item.id)
                  // @ts-ignore
                  if (typeof result === "string" && result?.includes("Error")) {
                    // @ts-ignore
                    setError({ message: result })
                  } else {
                    setLatestTx({ txhash: result.txhash })
                  }
                } catch (error) {
                  setError(error as Error)
                } finally {
                  setIsTxLoading(false)
                }
              }}
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
        <Card className="blankWithPad">
          <FormError>No ledgers</FormError>
        </Card>
      )}
    </Form>
  )
}

export default SelectLedgerForm
