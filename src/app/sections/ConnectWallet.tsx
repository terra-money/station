/*
 * @Author: lmk
 * @Date: 2022-05-25 11:23:10
 * @LastEditTime: 2022-06-01 16:37:26
 * @LastEditors: lmk
 * @Description:
 */
import { useTranslation } from "react-i18next"
import { STATION } from "config/constants"
import { RenderButton } from "types/components"
import { useAddress } from "data/wallet"
import { Button, ExternalLink } from "components/general"
import { Grid } from "components/layout"
import { List } from "components/display"
import { ModalButton } from "components/feedback"
import { FormHelp } from "components/form"
import { useAuth } from "auth"
import SwitchWallet from "auth/modules/select/SwitchWallet"
import Connected from "./Connected"
import { useEffect, useState } from "react"
import { atom, useRecoilState } from "recoil"
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
  const { available } = useAuth()
  const address = useAddress()
  const [list, setList] = useState<any>([])
  const [misesState, setmisesState] = useRecoilState(misesStateDefault)
  const getAddress = () => {
    window.ethereum
      .request({
        method: "mises_requestAccounts",
        params: [],
      })
      .then((res: { misesId: string }) => {
        setmisesState({ ...misesState, misesId: res.misesId })
        localStorage.setItem("metamask", JSON.stringify(true))
      })
  }
  useEffect(() => {
    if (window.ethereum) {
      const metamask = JSON.parse(localStorage.getItem("metamask") || "false")
      window.ethereum._metamask.isUnlocked?.().then((res) => {
        metamask && res && getAddress()
      })
      // window.ethereum.on('accountsChanged').then(res=>{
      //   if(res.length){
      //     getAddress()
      //   }
      // })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (window.ethereum) {
      setList([
        // ...availableConnections.map(({ type, identifier, name, icon }) => ({
        //   src: icon,
        //   children: name,
        //   onClick: () => connect(type, identifier),
        // })),
        {
          src: "https://www.mises.site/static/images/index/favicon.ico",
          children: "MetaMask Wallet",
          onClick: () => {
            getAddress()
          },
        },
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (address) return <Connected />
  const defaultRenderButton: Props["renderButton"] = (open) => (
    <Button onClick={open} size="small" outline>
      {t("Connect")}
    </Button>
  )

  return (
    <ModalButton
      title={t("Connect wallet")}
      renderButton={renderButton ?? defaultRenderButton}
      maxHeight
    >
      <Grid gap={20}>
        <SwitchWallet />
        <List list={available.length ? available : list} />
        {!!available.length && (
          <FormHelp>
            Use <ExternalLink href={STATION}>Terra Station</ExternalLink> on the
            browser to access with Ledger device
          </FormHelp>
        )}
      </Grid>
    </ModalButton>
  )
}

export default ConnectWallet
