import preconfigured from "../../config/preconfigured.json"

const usePreconfigured = () => {
  return preconfigured.map(({ name, mnemonic, password }) => ({
    name,
    mnemonic,
    password,
  })) as PreconfiguredWallet[]
}

export default usePreconfigured
