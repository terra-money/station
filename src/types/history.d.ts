interface AccountHistory {
  pagination: {
    total: string
    next_key: string | null
  }
  tx_responses: AccountHistoryItem[]
}

interface AccountHistoryItem {
  txhash: string
  timestamp: any
  code: number
  // collapsed?: number // WHAT IS THIS?
  tx: {
    body: {
      messages: any[]
      memo?: string
    }
    auth_info: {
      fee: {
        amount: CoinData[]
      }
    }
  }
  raw_log?: string
}

interface TxMessage {
  msgType: string
  canonicalMsg: string[]
}
