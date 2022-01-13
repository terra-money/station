import { Tx as Tx_pb } from "@terra-money/terra.proto/cosmos/tx/v1beta1/tx"
import { Tx } from "@terra-money/terra.js"

const decodeTx = (encodedTx: string) => {
  try {
    const txBytes = Buffer.from(encodedTx, "base64")
    return Tx.fromProto(Tx_pb.decode(txBytes))
  } catch {
    return
  }
}

export default decodeTx
