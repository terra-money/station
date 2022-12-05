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
  const provider = window.mises;
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
      return Promise.resolve();
    }
    
    open?.()
  }
  const isUnlocked = ()=>{
    return provider ? provider.isunlocked() : Promise.resolve(false);
  }
  return {
    getAddress,
    isUnlocked
  }
}
