import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import UsbIcon from "@mui/icons-material/Usb"
import { Button } from "components/general"
import { Grid } from "components/layout"
import { FormError } from "components/form"
import useAuth from "../hooks/useAuth"
import * as ledger from "./ledger"

const TERRA_DEFAULT_PATH = [44, 118, 0, 0, 0]
const COSMOS_DEFAULT_PATH = [44, 330, 0, 0, 0]

const AccessWithLedgerForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { connectLedger } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error>()
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [customDerivationIsEnabled, setCustomDerivationIsEnabled] =
    useState(false)
  const [appInteger, setAppInteger] = useState(118)
  const [pathState, setPathState] = useState(TERRA_DEFAULT_PATH)

  const handleDerivation = (e: React.ChangeEvent) => {
    let target = e.target as HTMLElement
    let tid = target.id
    let targetValue = 0
    let pathIdx = 0
    switch (tid) {
      case "path1":
        targetValue = parseInt((target as HTMLSelectElement).value)
        setAppInteger(targetValue)
        pathIdx = 1
        break
      case "path2":
        pathIdx = 2
        targetValue = parseInt((target as HTMLInputElement).value)
        break
      case "path3":
        pathIdx = 3
        targetValue = parseInt((target as HTMLInputElement).value)
        break
      case "path4":
        pathIdx = 4
        targetValue = parseInt((target as HTMLInputElement).value)
        break
    }
    let newPath = pathState
    newPath[pathIdx] = targetValue
    setPathState(newPath)

    console.log(pathState)
  }

  const connect = async () => {
    setIsLoading(true)
    setError(undefined)

    try {
      const address = await ledger.getTerraAddress()
      connectLedger(address)
      navigate("/wallet", { replace: true })
    } catch (error) {
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  let derivationSelector = (
    <div style={{ whiteSpace: "nowrap", maxWidth: "50px" }}>
      <select
        onChange={handleDerivation}
        name="path0"
        id="path0"
        disabled={!customDerivationIsEnabled}
      >
        <option value="44">44</option>
      </select>
      /
      <select
        onChange={handleDerivation}
        name="path1"
        id="path1"
        disabled={!customDerivationIsEnabled}
        value={appInteger}
      >
        <option value="118">118</option>
        <option value="330">330</option>
      </select>
      /&nbsp;
      <input
        onChange={handleDerivation}
        type="number"
        name="path2"
        id="path2"
        disabled={!customDerivationIsEnabled}
        defaultValue="0"
      ></input>
      /&nbsp;
      <input
        onChange={handleDerivation}
        type="number"
        name="path3"
        id="path3"
        disabled={!customDerivationIsEnabled}
        defaultValue="0"
      ></input>
      /&nbsp;
      <input
        onChange={handleDerivation}
        type="number"
        name="path4"
        id="path4"
        disabled={!customDerivationIsEnabled}
        defaultValue="0"
      ></input>
    </div>
  )

  let advancedPanel
  if (showAdvancedSettings) {
    advancedPanel = (
      <Grid gap={10} className="text-left">
        <br></br>
        <hr
          style={{ color: "#11AA11", margin: "1px", border: "1px solid grey" }}
        ></hr>
        <br></br>
        <p className="text-left">
          {t(
            "It is recommended you only use advanced settings if you know what you are doing. Otherwise, stick with the defaults."
          )}
        </p>
        <h4>Derivation Path:</h4>
        <div>
          <select
            name="derivationPath"
            onClick={(e) => {
              const target = e.target as HTMLSelectElement
              switch (target.value) {
                case "terraDefaults":
                  setAppInteger(118)
                  setPathState(TERRA_DEFAULT_PATH)
                  setCustomDerivationIsEnabled(false)
                  break
                case "cosmosDefaults":
                  setAppInteger(330)
                  setPathState(COSMOS_DEFAULT_PATH)
                  setCustomDerivationIsEnabled(false)
                  break
                case "custom":
                  setCustomDerivationIsEnabled(true)
                  break
              }
            }}
            defaultValue={"terraDefaults"}
          >
            <option value="terraDefaults">Terra Defaults</option>
            <option value="cosmosDefaults">
              Cosmos Defaults (Keplr compatible)
            </option>
            <option value="custom">Custom</option>
          </select>
          <br></br>
          <br></br>
          {derivationSelector}
        </div>
      </Grid>
    )
  } else {
    // if user closes Advanced Settings, return everything back to defaults
    if (pathState != TERRA_DEFAULT_PATH) {
      setPathState(TERRA_DEFAULT_PATH)
    }
  }

  return (
    <div>
      <Grid gap={20} className="center">
        <p className="center">
          <UsbIcon style={{ fontSize: 56 }} />
        </p>

        {t("Plug in a Ledger device")}

        {error && <FormError>{error.message}</FormError>}

        <Button onClick={connect} loading={isLoading} color="primary" block>
          {t("Connect")}
        </Button>
        <a
          href="#"
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
        >
          {t(
            showAdvancedSettings
              ? "Close Advanced Settings"
              : "Open Advanced Settings"
          )}
        </a>
      </Grid>
      {advancedPanel}
    </div>
  )
}

export default AccessWithLedgerForm
