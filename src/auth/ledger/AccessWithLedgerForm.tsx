import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import UsbIcon from "@mui/icons-material/Usb"
import { Button } from "components/general"
import { Grid } from "components/layout"
import { FormError } from "components/form"
import useAuth from "../hooks/useAuth"
import * as ledger from "./ledger"
import {
  TERRA_APP_NUMBER,
  COSMOS_APP_NUMBER,
  DEFAULT_PATH_TERRA,
  DEFAULT_PATH_COSMOS,
} from "./ledger"

const AccessWithLedgerForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { connectLedger } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error>()
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [customDerivationIsEnabled, setCustomDerivationIsEnabled] =
    useState(false)
  const [pathState, setPathState] = useState([...DEFAULT_PATH_TERRA])

  const handleDerivation = (e: React.ChangeEvent) => {
    let target = e.target as HTMLElement
    let tid = target.id
    let targetValue = 0
    let pathIdx = 0
    switch (tid) {
      case "path0":
        break
      case "path1":
        targetValue = parseInt((target as HTMLSelectElement).value)
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
    let newPath = [...pathState]
    newPath[pathIdx] = targetValue
    setPathState(newPath)
  }

  const connect = async () => {
    setIsLoading(true)
    setError(undefined)

    try {
      const address = await ledger.getTerraAddress(pathState)
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
        value={pathState[0]}
      >
        <option value="44">44</option>
      </select>
      /
      <select
        onChange={handleDerivation}
        name="path1"
        id="path1"
        disabled={!customDerivationIsEnabled}
        value={pathState[1]}
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
        value={pathState[2]}
      ></input>
      /&nbsp;
      <input
        onChange={handleDerivation}
        type="number"
        name="path3"
        id="path3"
        disabled={!customDerivationIsEnabled}
        value={pathState[3]}
      ></input>
      /&nbsp;
      <input
        onChange={handleDerivation}
        type="number"
        name="path4"
        id="path4"
        disabled={!customDerivationIsEnabled}
        value={pathState[4]}
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
            onChange={(e) => {
              const target = e.target as HTMLSelectElement
              switch (target.value) {
                case "terraDefaults":
                  setPathState(DEFAULT_PATH_TERRA)
                  setCustomDerivationIsEnabled(false)
                  break
                case "cosmosDefaults":
                  setPathState(DEFAULT_PATH_COSMOS)
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
    if (customDerivationIsEnabled) {
      setCustomDerivationIsEnabled(false)
    }
    if (pathState !== DEFAULT_PATH_TERRA) {
      setPathState(DEFAULT_PATH_TERRA)
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
