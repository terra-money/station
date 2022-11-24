import { useParams } from "react-router-dom"

const useProposalId = () => {
  const { id, chain } = useParams()
  return { id: Number(id), chain: chain ?? "" }
}

export default useProposalId
