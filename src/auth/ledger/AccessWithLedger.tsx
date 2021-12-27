import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import UsbIcon from "@mui/icons-material/Usb"
import { Button } from "components/general"
import { Card, Grid, Page } from "components/layout"
import { FormError } from "components/form"
import useAuth from "../hooks/useAuth"
import * as ledger from "./ledger"

const AccessWithLedger = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { connectLedger, wallet } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error>()

  const connect = async () => {
    setIsLoading(true)
    setError(undefined)

    try {
      const address = await ledger.getTerraAddress()
      connectLedger(address)
    } catch (error) {
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (wallet) navigate("/wallet", { replace: true })
  }, [navigate, wallet])

  return (
    <Page title={t("Access with ledger")} small>
      <Card>
        <Grid gap={20} className="center">
          <p className="center">
            <UsbIcon style={{ fontSize: 56 }} />
          </p>

          {t("Plug in the Ledger Wallet")}

          {error && <FormError>{error.message}</FormError>}

          <Button onClick={connect} loading={isLoading} color="primary" block>
            {t("Connect")}
          </Button>
        </Grid>
      </Card>
    </Page>
  )
}

export default AccessWithLedger
