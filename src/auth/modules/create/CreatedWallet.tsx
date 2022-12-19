import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import DoneAllIcon from "@mui/icons-material/DoneAll"
import { Grid } from "components/layout"
import { Submit } from "components/form"
import { Details } from "components/display"
import useAuth from "../../hooks/useAuth"
import { addressFromWords } from "utils/bech32"

const CreatedWallet = ({ name, words }: SingleWallet) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { connect } = useAuth()

  const address = addressFromWords(words["330"])
  const submit = () => {
    connect(name)
    navigate("/", { replace: true })
  }

  return (
    <article>
      <Grid gap={28}>
        <header className="center">
          <DoneAllIcon className="success" style={{ fontSize: 56 }} />
          <h1>{t("Wallet generated successfully")}</h1>
        </header>

        <Details>
          <article>
            <h1>{name}</h1>
            <p>{address}</p>
          </article>
        </Details>

        <Submit type="button" onClick={submit}>
          {t("Connect")}
        </Submit>
      </Grid>
    </article>
  )
}

export default CreatedWallet
