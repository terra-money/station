import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import DoneAllIcon from "@mui/icons-material/DoneAll"
import { Grid } from "components/layout"
import { Submit } from "components/form"
import { Details } from "components/display"
import useAuth from "../../hooks/useAuth"
import { useCreateWallet } from "./CreateWalletWizard"

const CreatedWallet = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { connect } = useAuth()
  const { createdWallet } = useCreateWallet()

  if (!createdWallet) return null
  const { name, address } = createdWallet

  const submit = () => {
    connect(name)
    navigate("/wallet", { replace: true })
  }

  return (
    <article>
      <Grid gap={28}>
        <header className="center">
          <DoneAllIcon className="success" style={{ fontSize: 56 }} />
          <h1>{t("Wallet generated successfully")}</h1>
        </header>

        <Details>
          <dl>
            <dt>{t("Name")}</dt>
            <dd>{name}</dd>
            <dt>{t("Address")}</dt>
            <dd>{address}</dd>
          </dl>
        </Details>

        <Submit type="button" onClick={submit}>
          {t("Connect")}
        </Submit>
      </Grid>
    </article>
  )
}

export default CreatedWallet
