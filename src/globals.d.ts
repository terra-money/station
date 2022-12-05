/*
 * @Author: lmk
 * @Date: 2022-08-02 17:03:00
 * @LastEditTime: 2022-11-15 09:38:07
 * @LastEditors: lmk
 * @Description:
 */
interface ethereum {
  request: (item: { method: string; params: any[] }) => Promise<
    | {
        auth: string
        misesId: string
        accounts: [string]
      }
    | any
  >
  on: (event, cb: Function) => Promise<string[]>
  _metamask: {
    isUnlocked: () => Promise<boolean>
  }
  _handleConnect: () => Promise<any>
  chainId: number | string
  providers: any[]
  providerMap: Map
}
interface OfflineAminoSigner {
  /**
   * Get AccountData array from wallet. Rejects if not enabled.
   */
  readonly getAccounts: () => Promise<readonly any[]>;
  /**
   * Request signature from whichever key corresponds to provided bech32-encoded address. Rejects if not enabled.
   *
   * The signer implementation may offer the user the ability to override parts of the signDoc. It must
   * return the doc that was signed in the response.
   *
   * @param signerAddress The address of the account that should sign the transaction
   * @param signDoc The content that should be signed
   */
  readonly signAmino: (
    signerAddress: string,
    signDoc: any
  ) => Promise<any>;
}
interface OfflineDirectSigner {
  readonly getAccounts: () => Promise<readonly any[]>;
  readonly signDirect: (
    signerAddress: string,
    signDoc: SignDoc
  ) => Promise<any>;
}
interface SecretUtils {
  getPubkey: () => Promise<Uint8Array>;
  decrypt: (ciphertext: Uint8Array, nonce: Uint8Array) => Promise<Uint8Array>;
  encrypt: (contractCodeHash: string, msg: object) => Promise<Uint8Array>;
  getTxEncryptionKey: (nonce: Uint8Array) => Promise<Uint8Array>;
}
interface Window {
  misesEthereum: ethereum,
  ethereum: ethereum,
  mises?: any;
  getOfflineSigner?: (
    chainId: string
  ) => OfflineAminoSigner & OfflineDirectSigner;
  getOfflineSignerOnlyAmino?: (chainId: string) => OfflineAminoSigner;
  getOfflineSignerAuto?: (
    chainId: string
  ) => Promise<OfflineAminoSigner | OfflineDirectSigner>;
  getEnigmaUtils?: (chainId: string) => SecretUtils;
}

interface globalThis {
  IS_REACT_ACT_ENVIRONMENT: boolean
}
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test"
    readonly PUBLIC_URL: string
  }
}

declare module "*.avif" {
  const src: string
  export default src
}

declare module "*.bmp" {
  const src: string
  export default src
}

declare module "*.gif" {
  const src: string
  export default src
}

declare module "*.jpg" {
  const src: string
  export default src
}

declare module "*.jpeg" {
  const src: string
  export default src
}

declare module "*.png" {
  const src: string
  export default src
}

declare module "*.webp" {
  const src: string
  export default src
}

declare module "*.svg" {
  import * as React from "react"

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >

  const src: string
  export default src
}

declare module "*.module.css" {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module "*.module.sass" {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module "*.module.scss" {
  const classes: {
    readonly [key: string]: string
  }
  export default classes
  declare module "*.scss"
}
