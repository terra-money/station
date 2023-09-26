import React, { useEffect } from "react"
import { useAtom } from "jotai"
import { getKeys } from "utils/localStorage/nostr"
import { keysAtom } from "utils/nostr/atoms"

const KeysProvider = (props: { children: React.ReactNode }) => {
  const [keys, setKeys] = useAtom(keysAtom)

  useEffect(() => {
    getKeys().then(setKeys)
  }, [])

  if (keys === undefined) return null // Wait until we find keys from storage

  return <>{props.children}</>
}

export default KeysProvider
