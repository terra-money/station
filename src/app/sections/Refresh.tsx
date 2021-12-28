import { useQueryClient } from "react-query"
import RefreshIcon from "@mui/icons-material/Refresh"
import HeaderIconButton from "../components/HeaderIconButton"

const Prefreneces = () => {
  const queryClient = useQueryClient()

  return (
    <HeaderIconButton onClick={() => queryClient.invalidateQueries()}>
      <RefreshIcon style={{ fontSize: 18 }} />
    </HeaderIconButton>
  )
}

export default Prefreneces
