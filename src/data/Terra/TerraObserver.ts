import { Block } from "@terra-money/feather.js"
import { useEffect, useRef, useState } from "react"
import { OBSERVER } from "config/constants"
import { useChainID } from "../wallet"

export const useTerraObserver = () => {
  const ws = useRef<WebSocket | null>(null)
  const chainID = useChainID()
  const [block, setBlock] = useState<Block>()
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<Event | CloseEvent>()

  useEffect(() => {
    if (!ws.current) {
      ws.current = new WebSocket(OBSERVER)

      ws.current.onopen = () => {
        setConnected(true)
        ws.current?.send(
          JSON.stringify({ subscribe: "new_block_height", chain_id: chainID })
        )
      }

      ws.current.onclose = (error) => {
        setConnected(false)
        setError(error)
      }

      ws.current.onerror = (error) => {
        setConnected(false)
        setError(error)
      }

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data)
        setBlock(message.data.block)
      }
    }

    return () => {
      ws.current?.close()
    }
  }, [chainID])

  return { connected, error, block }
}
