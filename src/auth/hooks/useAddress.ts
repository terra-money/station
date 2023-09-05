// import { useConnectedWallet } from "@terra-money/wallet-provider"
// import useAuth from "./useAuth"

import { misesStateDefault } from "app/sections/ConnectWallet"
import { useRecoilState, useRecoilValue } from "recoil"
import { walletProvider } from "utils/hooks/useMetamaskProvider"

/* auth | wallet-provider */
const useAddress = () => {
  // const connected = useConnectedWallet()
  // const { wallet } = useAuth()
  const misesState = useRecoilValue(misesStateDefault)
  return misesState.misesId
}
export default useAddress

export const isMisesWallet = async ()=>{
  const provider = await walletProvider();
  return ["extension", "mobile-web"].includes(provider?.mode) || false
}
export function useConnectWallet() {
  const [misesState, setmisesState] = useRecoilState(misesStateDefault)
  const chainId = 'mainnet';

  const getAddress = async (open?: () => void) => {
    const provider = await walletProvider();
    const isMises = await isMisesWallet();
    if(isMises){
      await provider.enable(chainId);
    
      const offlineSigner = provider.getOfflineSigner?.(chainId);
      
      if(offlineSigner){
        offlineSigner.getAccounts().then((res:{address: string}[])=>{
          const [account] = res;
          setmisesState({ ...misesState, misesId: account.address })
          localStorage.setItem('isConnected', 'true');
        });
        return Promise.resolve();
      }
      open?.()
    }else{
      provider?.request({
          method: "mises_requestAccounts",
          params: [],
        })
        .then((res: { misesId: string }) => {
          setmisesState({ ...misesState, misesId: res.misesId })
          localStorage.setItem("isConnected", "true")
        })
      if (!provider || !provider.chainId) {
        open?.()
        // window.location.reload()
      }
    }
  }
  const isUnlocked = async ()=>{
    const provider = await walletProvider();
    if(!provider){
      return Promise.resolve(false);
    }
    const isMises = await isMisesWallet();
    return provider ? (!isMises ? provider._metamask?.isUnlocked() : provider?.isUnlocked()) : Promise.resolve(false);
  }
  return {
    getAddress,
    isUnlocked
  }
}

