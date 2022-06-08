/*
 * @Author: lmk
 * @Date: 2022-05-25 15:17:49
 * @LastEditTime: 2022-06-08 11:29:30
 * @LastEditors: lmk
 * @Description:
 */
// import { useConnectedWallet } from "@terra-money/wallet-provider"
// import useAuth from "./useAuth"

import { misesStateDefault } from "app/sections/ConnectWallet"
import { useRecoilState, useRecoilValue } from "recoil"

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
  const getAddress = () => {
    window.ethereum
      ?.request({
        method: "mises_requestAccounts",
        params: [],
      })
      .then((res: { misesId: string }) => {
        console.log(res.misesId)
        setmisesState({ ...misesState, misesId: res.misesId })
        localStorage.setItem("metamask", JSON.stringify(true))
      })
    // if(!window.ethereum){

    // }
  }
  return {
    getAddress,
  }
}
