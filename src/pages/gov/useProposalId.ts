import { useParams } from "react-router-dom"

const useProposalId = () => {
  const { id } = useParams()
  return Number(id)
}

export default useProposalId
