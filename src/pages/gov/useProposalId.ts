import { useParams } from "react-router-dom"

const useProposalId = () => {
  const { id, chain } = useParams()
  return { id: id ?? "", chain: chain ?? "" }
}

export default useProposalId
