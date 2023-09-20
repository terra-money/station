import { ReactNode, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { SeedKey } from "@terra-money/feather.js"
import createContext from "utils/createContext"
import { addWallet } from "../../scripts/keystore"
import CreateWalletForm from "./CreateWalletForm"
import CreatedWallet from "./CreatedWallet"
import { wordsFromAddress } from "utils/bech32"

export interface Values {
  name: string
  password: string
  mnemonic: string
  index: number
}

/* context */
interface CreateWallet {
  /* step */
  setStep: (index: number) => void

  /* form values */
  generated: boolean
  values: Values
  setValues: (values: Values) => void

  /* create wallet */
  createdWallet?: SingleWallet
  createWallet: (coinType: Bip, index?: number) => void
}

export const [useCreateWallet, CreateWalletProvider] =
  createContext<CreateWallet>("useCreateWallet")

interface Props {
  defaultMnemonic?: string
  beforeCreate: ReactNode
}

const DefaultValues = { name: "", password: "", mnemonic: "", index: 0 }

const CreateWalletWizard = ({ defaultMnemonic = "", beforeCreate }: Props) => {
  /* step */
  const location = useLocation()
  const navigate = useNavigate()
  const step = Number(location.hash.replace("#", "")) || 1
  const setStep = (index: number) => navigate({ hash: String(index) })

  /* form values */
  const initial = { ...DefaultValues, mnemonic: defaultMnemonic }
  const [values, setValues] = useState(initial)

  /* create wallet */
  const [createdWallet, setCreatedWallet] = useState<SingleWallet>()
  const createWallet = (coinType: Bip, index = 0) => {
    const { name, password, mnemonic } = values

    const seed = SeedKey.seedFromMnemonic(mnemonic)
    const key330 = new SeedKey({ seed, coinType, index })
    const key118 = new SeedKey({ seed, coinType: 118, index })
    const key60 = new SeedKey({ seed, coinType: 60, index })
    const words = {
      "330": wordsFromAddress(key330.accAddress("terra")),
      "118": wordsFromAddress(key118.accAddress("terra")),
      "60": wordsFromAddress(key60.accAddress("inj")),
    }

    const pubkey = {
      // @ts-expect-error
      "330": key330.publicKey.key,
      // @ts-expect-error
      "118": key118.publicKey.key,
      // @ts-expect-error
      "60": key60.publicKey.key,
    }

    addWallet({
      name,
      password,
      words,
      seed,
      pubkey,
      index,
      legacy: coinType === 118,
    })
    setCreatedWallet({ name, words })
    setStep(3)
  }

  /* effect: reset memory on unmount */
  useEffect(() => {
    return () => {
      setValues(DefaultValues)
      setCreatedWallet(undefined)
    }
  }, [setValues])

  /* render */
  const render = () => {
    switch (step) {
      case 1:
        return <CreateWalletForm />

      case 2:
        if (!values.mnemonic) setStep(1)
        return beforeCreate

      case 3:
        if (!createdWallet) return null
        return <CreatedWallet {...createdWallet} />
    }
  }

  const generated = !!defaultMnemonic
  const value = {
    setStep,
    generated,
    values,
    setValues,
    createdWallet,
    createWallet,
  }

  return <CreateWalletProvider value={value}>{render()}</CreateWalletProvider>
}

export default CreateWalletWizard
