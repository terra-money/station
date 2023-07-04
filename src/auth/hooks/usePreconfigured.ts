import { useCallback } from "react"
import { getStoredWallets } from "../scripts/keystore"
import { SeedKey } from "@terra-money/feather.js"
import { wordsFromAddress } from "utils/bech32"
import useAuth from "./useAuth"
import encrypt from "../scripts/encrypt"
import preconfigured from "../../config/preconfigured.json"

const usePreconfigured = () => {
  const { storeWallet, setWallet, addWallet } = useAuth()

  const getPreconfigured = () => {
    return preconfigured.map(({ name, mnemonic, password }) => ({
      name,
      mnemonic,
      password,
    })) as PreconfiguredWallet[]
  }

  const connectPreconfigured = useCallback(
    (preWallet: PreconfiguredWallet) => {
      const wallets = getStoredWallets()
      const storedWallet = wallets.find(
        (wallet) => wallet.name === preWallet.name
      )
      if (storedWallet) {
        storeWallet(storedWallet as any)
        setWallet(storedWallet as any)
      } else {
        const { name, password, mnemonic } = preWallet
        const index = 0
        const legacy = false
        const seed = SeedKey.seedFromMnemonic(mnemonic)
        const key330 = new SeedKey({ seed, coinType: 330, index: 0 })
        const key118 = new SeedKey({ seed, coinType: 118, index: 0 })
        const words = {
          "330": wordsFromAddress(key330.accAddress("terra")),
          "118": wordsFromAddress(key118.accAddress("terra")),
        }
        const pubkey = {
          // @ts-expect-error
          "330": key330.publicKey.key,
          // @ts-expect-error
          "118": key118.publicKey.key,
        }
        const encryptedSeed = encrypt(seed.toString("hex"), password)
        const wallet: SeedStoredWallet = {
          name,
          words,
          encryptedSeed,
          pubkey,
          index,
          legacy,
        }
        addWallet({ name, password, words, seed, pubkey, index, legacy })
        storeWallet(wallet)
        setWallet(wallet)
      }
    },
    // eslint-disable-next-line
    [setWallet]
  )
  return {
    getPreconfigured,
    connectPreconfigured,
  }
}

export default usePreconfigured
