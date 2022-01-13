import { signModeToJSON } from "@terra-money/terra.proto/cosmos/tx/signing/v1beta1/signing"
import { SignatureV2 } from "@terra-money/terra.js"

const SignatureDecriptorToData = (
  descriptor: SignatureV2.Descriptor
): SignatureV2.Descriptor.Data => {
  if (descriptor.single) {
    const { mode, signature } = descriptor.single
    return { single: { mode: signModeToJSON(mode), signature } }
  }

  if (descriptor.multi) {
    const bitarray = descriptor.multi.bitarray.toData()
    const signatures = descriptor.multi.signatures.map((sig) =>
      SignatureDecriptorToData(sig)
    )

    return { multi: { bitarray, signatures } }
  }

  throw new Error("must be one of single or multi")
}

const SignatureV2ToData = (sigv2: SignatureV2): SignatureV2.Data => {
  const public_key = sigv2.public_key.toData()
  const sequence = sigv2.sequence.toFixed()
  const data = SignatureDecriptorToData(sigv2.data)
  return { public_key, data, sequence }
}

export default SignatureV2ToData
