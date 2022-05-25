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
import { Modal, Mode } from "components/feedback"
import { useThemeAnimation } from "data/settings/Theme"

interface DeviceInterface {
  name: string
  id: string
}

const SelectLedgerForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [ledgers, setLedgers] = useState<DeviceInterface[]>([])
  const [tx, setTx] = useState<any>(null)
  const setLatestTx = useSetRecoilState(latestTxState)
  const { wallet, validatePassword, isUseBio, decodeBioAuthKey, ...auth } =
    useAuth()
  const { state }: { state: any } = useLocation()
  const animation = useThemeAnimation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error>()

  const getLedgers = async () => {
    const ledgers: unknown = await WebViewMessage(RN_APIS.GET_LEDGER_LIST)
    console.log(ledgers)
    // @ts-ignore
    setLedgers(ledgers)
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
  }, [])

  return (
    <Form>
      {/*{isLoading && (*/}
      {/*  <Modal*/}
      {/*    modalType={isWallet.mobile() ? Mode.TX : Mode.DEFAULT}*/}
      {/*    icon={<img src={animation} width={100} height={100} alt="" />}*/}
      {/*    closeIcon={<CloseFullscreenIcon fontSize="inherit" />}*/}
      {/*    title={t("Confirm in your Ledger")}*/}
      {/*    isOpen*/}
      {/*  />*/}
      {/*)}*/}
      {!!ledgers.length ? (
        tx ? (
          ledgers?.map((item, idx) => (
            <Card
              key={item.id}
              title={item.name}
              extra={<ArrowForwardIosIcon className={styles.mobileExtra} />}
              onClick={async () => {
                console.log(tx)
                setIsLoading(true)
                setError(undefined)
                try {
                  const result = await auth.post(tx, item.id)
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
                  setIsLoading(false)
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
        <FormError>No ledgers</FormError>
      )}

      {error && <FormError>{error.message}</FormError>}
    </Form>
  )
}

export default SelectLedgerForm
