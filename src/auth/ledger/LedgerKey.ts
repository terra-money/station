import { Key, SignDoc, SignatureV2 } from "@terra-money/terra.js"
import * as ledger from "./ledger"

class LedgerKey extends Key {
  public sign(): Promise<Buffer> {
    throw new Error(
      "LedgerKey does not use sign() -- use createSignature() directly."
    )
  }

  public async createSignatureAmino(tx: SignDoc): Promise<SignatureV2> {
    const pubkeyBuffer = await ledger.getPubKey()

    if (!pubkeyBuffer) {
      throw new Error("failed getting public key from ledger")
    }

    const signatureBuffer = await ledger.sign(tx.toAminoJSON())

    if (!signatureBuffer) {
      throw new Error("failed signing from ledger")
    }

    if (!this.publicKey) {
      throw new Error("public key is undefined")
    }

    return new SignatureV2(
      this.publicKey,
      new SignatureV2.Descriptor(
        new SignatureV2.Descriptor.Single(
          SignatureV2.SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
          signatureBuffer.toString("base64")
        )
      ),
      tx.sequence
    )
  }
}

export default LedgerKey
