import { CreateTxOptions } from "@terra-money/terra.js"
import { NetworkInfo, TxResult } from "@terra-money/wallet-controller"
import { WalletPlugin, WalletPluginSession } from "@terra-money/wallet-types"

class WalletPluginStub implements WalletPlugin {
  name: string
  type: string
  icon: string
  identifier: string

  constructor() {
    this.name = ""
    this.type = ""
    this.icon = ""
    this.identifier = ""
  }

  async createSession(
    networks: NetworkInfo[]
  ): Promise<WalletPluginSession | null> {
    return new WalletPluginStub()
  }
}

class WalletPluginSessionStub implements WalletPluginSession {
  network: NetworkInfo | null
  terraAddress: string | null

  constructor() {
    this.network = null
    this.terraAddress = null
  }

  async connect(): Promise<void> {
    // Do nothing
  }

  async disconnect(): Promise<void> {
    // Do nothing
  }

  getMetadata?(): { [key: string]: any } {
    return {}
  }

  async post(txn: CreateTxOptions): Promise<TxResult> {
    return {
      result: {
        height: 0,
        txhash: "",
        raw_log: "",
      },
      success: true,
      chainID: "",
      msgs: [],
    }
  }
}
