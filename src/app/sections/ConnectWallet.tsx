/*
 * @Author: lmk
 * @Date: 2022-06-02 16:12:07
 * @LastEditTime: 2022-06-16 16:38:19
 * @LastEditors: lmk
 * @Description:
 */
/*
 * @Author: lmk
 * @Date: 2022-05-25 11:23:10
 * @LastEditTime: 2022-06-07 16:05:08
 * @LastEditors: lmk
 * @Description:
 */
import { useTranslation } from "react-i18next"
// import { STATION } from "config/constants"
import { RenderButton } from "types/components"
import { useAddress } from "data/wallet"
import { Button } from "components/general"
// import { Grid } from "components/layout"
// import { List } from "components/display"
import { ModalButton } from "components/feedback"
// import { FormHelp } from "components/form"
// import { useAuth } from "auth"
// import SwitchWallet from "auth/modules/select/SwitchWallet"
import Connected from "./Connected"
import { useEffect } from "react"
import { atom } from "recoil"
import { useConnectWallet } from "auth/hooks/useAddress"
import { Button as MuiButton } from "@mui/material"
// import { useWallet } from "@terra-money/wallet-provider"

interface Props {
  renderButton?: RenderButton
}
export const misesStateDefault = atom({
  key: "misesState",
  default: {
    misesId: "",
  },
})
const ConnectWallet = ({ renderButton }: Props) => {
  const { t } = useTranslation()

  // const { connect, availableConnections, availableInstallations } = useWallet()
  // const { available } = useAuth()
  const address = useAddress()
  // const [list] = useState<any>([])
  const { getAddress } = useConnectWallet()
  useEffect(() => {
    if (window.ethereum?.chainId) {
      const metamask = JSON.parse(localStorage.getItem("metamask") || "false")
      window.ethereum._metamask.isUnlocked?.().then((res) => {
        metamask && res && getAddress()
      })

      window.ethereum.on("accountsChanged", async (res: string[]) => {
        if (res.length) {
          getAddress()
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (address) return <Connected />
  const defaultRenderButton: Props["renderButton"] = (open) => (
    <Button onClick={() => getAddress(open)} size="small" outline>
      {/* 刷新 */}
      {t("Connect")}
    </Button>
  )

  return (
    <ModalButton
      title={t("Connect wallet")}
      renderButton={renderButton ?? defaultRenderButton}
      maxHeight
    >
      {/* <Grid gap={20}>
        <SwitchWallet />
        <List list={available.length ? available : list} />
        {!!available.length && (
          <FormHelp>
            Use <ExternalLink href={STATION}>Terra Station</ExternalLink> on the
            browser to access with Ledger device
          </FormHelp>
        )}
      </Grid> */}
      <div style={{ textAlign: "center" }}>
        <p style={{ marginBottom: 20 }}>
          Loading timed out Please try again later
        </p>
        <MuiButton
          onClick={() => window.location.reload()}
          variant="contained"
          size="large"
        >
          Refresh
        </MuiButton>
      </div>
    </ModalButton>
  )
}

export default ConnectWallet
