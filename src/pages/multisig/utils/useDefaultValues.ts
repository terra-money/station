import { useSearchParams } from "react-router-dom"

const useDefaultValues = () => {
  const [searchParams] = useSearchParams()
  const address = searchParams.get("address") || ""
  const tx = searchParams.get("tx") || ""
  return { address, tx: decodeURIComponent(tx) }
}

export default useDefaultValues
