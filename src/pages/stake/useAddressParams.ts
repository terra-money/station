import { useParams } from "react-router-dom"

const useAddressParams = () => {
  const { address } = useParams()
  if (!address) throw new Error("Operator address is not defined")
  return address
}

export default useAddressParams
