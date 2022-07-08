/* Address book */
interface AddressBook {
  name: string
  recipient: string
  memo?: string
}

/* Tokens */
type CustomTokens = Record<NetworkName, CustomTokensByNetwork>

interface CustomTokensByNetwork {
  ibc: IBCTokenInfoResponse[]
  cw20: CW20TokenInfoResponse[]
  cw721: CW721ContractInfoResponse[]
}

type CustomToken = CustomTokenCW20 | CustomTokenCW721 | CustomTokenIBC
interface CustomTokenIBC extends IBCTokenItem {
  denom: IBCDenom
}

interface CustomTokenCW20 extends CW20TokenInfoResponse {
  token: TerraAddress
}

interface CustomTokenCW721 extends CW721ContractInfoResponse {
  contract: TerraAddress
}

/* React Native */
interface Window {
  webkit: Webkit
  /**
   * A convenience API that we seem to expose in iOS.
   * Not sure whether Android does the same.
   * @see: https://github.com/react-native-community/react-native-webview/blob/25552977852427cf5fdc7b233fd1bbc7c77c18b0/ios/RNCWebView.m#L1128-L1146
   */
  ReactNativeWebView: {
    postMessage(msg: string): void
  }
}

interface Webkit {
  messageHandlers: {
    /**
     * Added due to our call to addScriptMessageHandler.
     * @see: https://github.com/react-native-community/react-native-webview/blob/25552977852427cf5fdc7b233fd1bbc7c77c18b0/ios/RNCWebView.m#L1244
     */
    ReactNativeWebView: {
      postMessage(message: string): void
    }
    /**
     * Added due to our call to addScriptMessageHandler.
     * @see: https://github.com/react-native-community/react-native-webview/blob/25552977852427cf5fdc7b233fd1bbc7c77c18b0/ios/RNCWebView.m#L214
     */
    ReactNativeHistoryShim: {
      postMessage(message: string): void
    }
  }
}
