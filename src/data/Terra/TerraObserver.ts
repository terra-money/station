import { Block } from "@terra-money/terra.js"
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
          JSON.stringify({
            jsonrpc: "2.0",
            method: "subscribe",
            id: "1",
            params: ["tm.event = 'NewBlock'"],
          })
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
        setBlock(message.result.data.value.block)
      }
    }

    return () => {
      ws.current?.close()
    }
  }, [chainID])

  return { connected, error, block }
}
