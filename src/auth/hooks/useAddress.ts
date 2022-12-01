/*
 * @Author: lmk
 * @Date: 2022-05-25 15:17:49
 * @LastEditTime: 2022-11-14 10:06:42
 * @LastEditors: lmk
 * @Description:
 */
// import { useConnectedWallet } from "@terra-money/wallet-provider"
// import useAuth from "./useAuth"

import { misesStateDefault } from "app/sections/ConnectWallet"
import { useRecoilState, useRecoilValue } from "recoil"
// import { useMetamaskProvider } from "utils/hooks/useMetamaskProvider"

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
  const provider = window.keplr;
  const chainId = 'mainnet';
  const getAddress = async (open?: () => void) => {
    await provider.enable(chainId);
    const offlineSigner = provider.getOfflineSigner?.(chainId);
    if(offlineSigner){
      offlineSigner.getAccounts().then((res:{address: string}[])=>{
        const [account] = res;
        setmisesState({ ...misesState, misesId: account.address })
        localStorage.setItem('isConnected', 'true');
      });
    }else{
      open?.()
    }
  }
  const isUnlocked = ()=>{
    return provider ? provider.isunlocked() : Promise.resolve(false);
  }
  return {
    getAddress,
    isUnlocked
  }
}
