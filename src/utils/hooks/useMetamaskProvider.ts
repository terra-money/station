export async function walletProvider() {
  if (window.misesWallet) {
    return window.misesWallet;
  }
  if(window.misesEthereum){
    return window.misesEthereum;
  }

  if (document.readyState === "complete") {
    return window.misesWallet || window.ethereum;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event: any) => {
      if (event.target && event.target.readyState === "complete") {
        window.misesWallet ? resolve(window.misesWallet) : resolve(window.ethereum);

        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
  
}