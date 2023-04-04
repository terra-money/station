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
import { isMisesWallet, useConnectWallet } from "auth/hooks/useAddress"
import { Button as MuiButton } from "@mui/material"
import { walletProvider } from "utils/hooks/useMetamaskProvider"
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

let connectLoading = false;

const ConnectWallet = ({ renderButton }: Props) => {
  const { t } = useTranslation()

  // const { connect, availableConnections, availableInstallations } = useWallet()
  // const { available } = useAuth()
  const address = useAddress()
  // const [list] = useState<any>([])
  const { getAddress, isUnlocked } = useConnectWallet()

  useEffect(() => {
    (async () => {
      const provider = await walletProvider()
      const isunlocked = await isUnlocked()
      const isConnected = localStorage.getItem('isConnected');
      if (isunlocked && !!isConnected && !connectLoading) {
        connectLoading = true;

        await getAddress();

        connectLoading = false;
      }

      const isMises = await isMisesWallet()
      if (!isMises && provider) {
        provider.on("accountsChanged", async (res: string[]) => {
          const metamask = JSON.parse(localStorage.getItem("isConnected") || "false")
          if (res.length && metamask) {
            getAddress()
          }
        })

      } else {
        window.addEventListener("mises_keystorechange", async () => {
          if (!connectLoading) {
            connectLoading = true;

            await getAddress()

            connectLoading = false;
          }
        })
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (address) return <Connected />
  const defaultRenderButton: Props["renderButton"] = (open) => (
    <Button onClick={() => getAddress(open)} size="small" outline>
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
