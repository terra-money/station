import qs from "qs"
import { Tx as UnsignedTx } from "@terra-money/terra.js"
import { useAddress } from "data/wallet"
import { useLCDClient } from "data/queries/lcdClient"

const useToPostMultisigTx = () => {
  const address = useAddress()
  const lcd = useLCDClient()

  return (tx: UnsignedTx) => {
    const pathname = "/multisig/post"
    const encodedTx = lcd.tx.encode(tx)
    return { pathname, search: qs.stringify({ address, tx: encodedTx }) }
  }
}

export default useToPostMultisigTx
