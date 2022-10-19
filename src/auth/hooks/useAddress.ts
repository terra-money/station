/*
 * @Author: lmk
 * @Date: 2022-05-25 15:17:49
 * @LastEditTime: 2022-10-19 11:26:24
 * @LastEditors: lmk
 * @Description:
 */
// import { useConnectedWallet } from "@terra-money/wallet-provider"
// import useAuth from "./useAuth"

import { misesStateDefault } from "app/sections/ConnectWallet"
import { useRecoilState, useRecoilValue } from "recoil"
import { useMetamaskProvider } from "utils/hooks/useMetamaskProvider"

/* auth | wallet-provider */
const useAddress = () => {
  // const connected = useConnectedWallet()
  // const { wallet } = useAuth()
  const misesState = useRecoilValue(misesStateDefault)
  return misesState.misesId
}
export default useAddress

export function useConnectWallet() {
  const [misesState, setmisesState] = useRecoilState(misesStateDefault)
  const provider = useMetamaskProvider()
  const getAddress = (open?: () => void) => {
    provider
      ?.request({
        method: "mises_requestAccounts",
        params: [],
      })
      .then((res: { misesId: string }) => {
        setmisesState({ ...misesState, misesId: res.misesId })
        localStorage.setItem("metamask", JSON.stringify(true))
      })
    if (!provider || !provider.chainId) {
      open?.()
      // window.location.reload()
    }
  }
  return {
    getAddress,
  }
}
