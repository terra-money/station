import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth"

const Disconnect = () => {
  const navigate = useNavigate()
  const { disconnect } = useAuth()

  useEffect(() => {
    disconnect()
    navigate("/", { replace: true })
  }, [disconnect, navigate])

  return null
}

export default Disconnect
